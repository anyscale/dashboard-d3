from enum import Enum
import random
import uuid
from datetime import datetime, timedelta
from task import TASK_STATUS
import task
from constants import NODE_STATUS, NODE_STARTUP_DELAY, RESOURCE_STATUS, TIME_FORMAT


class Node:

    def __init__(self, node_type, current_time_str):
        self.id = uuid.uuid4().hex
        self.status = NODE_STATUS.PENDING.value
        self.node_type_name = node_type.NAME.value
        self.ip = '10.' + '.'.join('%s' % random.randint(1, 254)
                                   for i in range(3))
        self.total_CPU = node_type.CPU.value
        self.total_GPU = node_type.GPU.value
        self.allocated_CPU = 0
        self.allocated_GPU = 0
        self.free_CPU = self.total_CPU
        self.free_GPU = self.total_GPU
        self.start_time = current_time_str
        self.duration = None
        self.end_time = None
        self.CPU_events = {}
        self.GPU_events = {}
        self.CPU_utilizations = {}
        self.GPU_utilizations = {}
        self.overall_CPU_utilizations = []
        self.overall_GPU_utilizations = []

        self.initialize_CPU_GPU()

    # @property
    # def id(self):
    #     return self.id

    def initialize_CPU_GPU(self):
        for i in range(self.total_CPU):
            self.CPU_events[str(i)] = [{
                'event': RESOURCE_STATUS.PENDING.value,
                'task_id': None,
                'start_time': self.start_time,
                'end_time': None
            }]
            self.CPU_utilizations[str(i)] = []
        for i in range(self.total_GPU):
            self.GPU_events[str(i)] = [{
                'event': RESOURCE_STATUS.PENDING.value,
                'task_id': None,
                'start_time': self.start_time,
                'end_time': None
            }]
            self.GPU_utilizations[str(i)] = []

    def check_status(self, node_status):
        return self.status == node_status.value

    # Check if a node is pending and has finished starting up
    def update_pending_node(self, current_time):
        if self.check_status(NODE_STATUS.PENDING) and (current_time - datetime.strptime(self.start_time, TIME_FORMAT) >= NODE_STARTUP_DELAY):
            return self._start_node(current_time.strftime(TIME_FORMAT))
        return []

    def _start_node(self, current_time_str):
        # Return tasks that need to be started
        task_ids = []
        self.status = NODE_STATUS.ACTIVE.value

        # Start the pending CPU tasks
        for cpu_id, cpu in self.CPU_events.items():
            # If the CPU already has an allocated task,
            # run the CPU and return the task id
            cpu[-1]['end_time'] = current_time_str
            if cpu[-1]['task_id'] != None:
                cpu.append({
                    'event': RESOURCE_STATUS.ACTIVE.value,
                    'task_id': cpu[-1]['task_id'],
                    'start_time': current_time_str,
                })
                task_ids.append(cpu[-1]['task_id'])
                # start_task(cpu[-1]['task_id'], current_time_str)
            # Otherwise set it to idle
            else:
                cpu.append({
                    'event': RESOURCE_STATUS.IDLE.value,
                    'task_id': None,
                    'start_time': current_time_str,
                })

        # Start the pending GPU tasks
        for gpu_id, gpu in self.GPU_events.items():
            # If the GPU already has an allocated task,
            # run the GPU and return the task id
            gpu[-1]['end_time'] = current_time_str
            if gpu[-1]['task_id'] != None:
                gpu.append({
                    'event': RESOURCE_STATUS.ACTIVE.value,
                    'task_id': gpu[-1]['task_id'],
                    'start_time': current_time_str,
                })
                task_ids.append(gpu[-1]['task_id'])
            # Otherwise set it to idle
            else:
                gpu.append({
                    'event': RESOURCE_STATUS.IDLE.value,
                    'task_id': None,
                    'start_time': current_time_str,
                })
        return list(dict.fromkeys(task_ids))

    def check_free_resources(self, CPU, GPU):
        return self.free_CPU >= CPU and self.free_GPU >= GPU and (self.check_status(NODE_STATUS.PENDING) or self.check_status(NODE_STATUS.ACTIVE))

    def allocate_for_task(self, task, current_time_str):
        self.free_CPU -= task.CPU_demand
        self.free_GPU -= task.GPU_demand
        self.allocated_CPU += task.CPU_demand
        self.allocated_GPU += task.GPU_demand

        fulfilled_CPU = 0
        fulfilled_GPU = 0
        for cpu_id, cpu in self.CPU_events.items():
            if (fulfilled_CPU == task.CPU_demand):
                break
            # If this is an available CPU
            # allocate the task to it and set the state
            if cpu[-1]['task_id'] == None:
                cpu[-1]['end_time'] = current_time_str
                if cpu[-1]['event'] == RESOURCE_STATUS.PENDING.value:
                    cpu.append({
                        'event': RESOURCE_STATUS.PENDING.value,
                        'task_id': task.id,
                        'start_time': current_time_str,
                    })
                elif cpu[-1]['event'] == RESOURCE_STATUS.IDLE.value:
                    cpu.append({
                        'event': RESOURCE_STATUS.ACTIVE.value,
                        'task_id': task.id,
                        'start_time': current_time_str,
                    })
                fulfilled_CPU += 1

        for gpu_id, gpu in self.GPU_events.items():
            if (fulfilled_GPU == task.GPU_demand):
                break
            # If this is an available GPU
            # allocate the task to it and set the state
            if gpu[-1]['task_id'] == None:
                gpu[-1]['end_time'] = current_time_str
                if gpu[-1]['event'] == RESOURCE_STATUS.PENDING.value:
                    gpu.append({
                        'event': RESOURCE_STATUS.PENDING.value,
                        'task_id': task.id,
                        'start_time': current_time_str,
                    })
                elif gpu[-1]['event'] == RESOURCE_STATUS.IDLE.value:
                    gpu.append({
                        'event': RESOURCE_STATUS.ACTIVE.value,
                        'task_id': task.id,
                        'start_time': current_time_str,
                    })
                fulfilled_GPU += 1

    def remove_task(self, task, current_time_str):
        self.free_CPU += task.CPU_demand
        self.free_GPU += task.GPU_demand
        self.allocated_CPU -= task.CPU_demand
        self.allocated_GPU -= task.GPU_demand

        removed_CPU = 0
        removed_GPU = 0
        for cpu_id, cpu in self.CPU_events.items():
            if (removed_CPU == task.CPU_demand):
                break
            # If this is an available CPU
            # allocate the task to it and set the state
            if cpu[-1]['task_id'] == task.id:
                cpu[-1]['end_time'] = current_time_str
                cpu.append({
                    'event': RESOURCE_STATUS.IDLE.value,
                    'task_id': None,
                    'start_time': current_time_str,
                })
                removed_CPU += 1

        for gpu_id, gpu in self.GPU_events.items():
            if (removed_GPU == task.GPU_demand):
                break
            # If this is an available GPU
            # allocate the task to it and set the state
            if gpu[-1]['task_id'] == task.id:
                gpu[-1]['end_time'] = current_time_str
                gpu.append({
                    'event': RESOURCE_STATUS.IDLE.value,
                    'task_id': None,
                    'start_time': current_time_str,
                })
                removed_GPU += 1

    def is_idle(self, idle_threshold, current_time):
        if self.check_status(NODE_STATUS.ACTIVE) and self.free_CPU == self.total_CPU and self.free_GPU == self.total_GPU:
            last_active_time_stamps = []
            for cpu_id, cpu in self.CPU_events.items():
                last_active_time_stamps.append(
                    datetime.strptime(cpu[-1]['start_time'], TIME_FORMAT))
            for gpu_id, gpu in self.GPU_events.items():
                last_active_time_stamps.append(
                    datetime.strptime(gpu[-1]['start_time'], TIME_FORMAT))
            latest_active_time = max(last_active_time_stamps)
            if (current_time - latest_active_time).total_seconds() >= idle_threshold:
                return True
        return False

    def terminate(self, current_time_str):
        self.status = NODE_STATUS.TERMINATED.value
        self.end_time = current_time_str
        self.duration = (datetime.strptime(self.end_time, TIME_FORMAT) -
                         datetime.strptime(self.start_time, TIME_FORMAT)).total_seconds()
        return

    def set_live_duration(self, current_time):
        if self.check_status(NODE_STATUS.PENDING) or self.check_status(NODE_STATUS.ACTIVE):
            self.duration = (
                current_time - datetime.strptime(self.start_time, TIME_FORMAT)).total_seconds()

    def generate_utilization_data(self, current_time_str):
        sum_cpu = 0
        sum_gpu = 0
        if self.total_CPU > 0:
            for cpu_id, cpu in self.CPU_events.items():
                latest_state = cpu[-1]["event"]
                if latest_state == "pending" or latest_state == "idle":
                    mu = 10
                    sigma = 10
                else:
                    mu = 70
                    sigma = 50
                utilization = min(max(random.gauss(mu, sigma), 0), 100)
                self.CPU_utilizations[cpu_id].append({
                    "time": current_time_str,
                    "utilization": utilization
                })
                sum_cpu += utilization
            self.overall_CPU_utilizations.append({
                "time": current_time_str,
                "value": sum_cpu / self.total_CPU 
            })
        if self.total_GPU > 0:
            for gpu_id, gpu in self.GPU_events.items():
                latest_state = gpu[-1]["event"]
                if latest_state == "pending" or latest_state == "idle":
                    mu = 10
                    sigma = 10
                else:
                    mu = 70
                    sigma = 50
                utilization = min(max(random.gauss(mu, sigma), 0), 100)
                self.GPU_utilizations[gpu_id].append({
                    "time": current_time_str,
                    "utilization": utilization
                })
                sum_gpu += utilization
            self.overall_GPU_utilizations.append({
                "time": current_time_str,
                "value": sum_gpu / self.total_GPU
            })

