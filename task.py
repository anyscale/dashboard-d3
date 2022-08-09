import uuid
from datetime import datetime, timedelta
from constants import TIME_FORMAT, TASK_STATUS, NODE_STATUS
# from node import NODE_STATUS
# import node

class Task:
    def __init__(self, CPU_demand, GPU_demand, current_time_str):
        self.id = uuid.uuid4().hex
        self.status = TASK_STATUS.PENDING.value
        self.CPU_demand = CPU_demand
        self.GPU_demand = GPU_demand
        self.creation_time = current_time_str # tasks should be allocated at the same time of creation
        self.allocated_node_id = None
        self.start_time = None
        self.end_time = None
        self.duration = None

    def check_status(self, task_status):
        return self.status == task_status
    
    def update_end_time(self, end_time):
        end_time_str = end_time.strftime(TIME_FORMAT)
        start_time = datetime.strptime(self.start_time, TIME_FORMAT)
        duration = (end_time - start_time).total_seconds()
        self.end_time = end_time_str
        self.duration = duration

    # Assign a task on a node
    # If the node is already active, start the task right away
    def assign_to_node(self, node_id, node_status, current_time_str):
        self.status = TASK_STATUS.PENDING.value
        self.allocated_node_id = node_id
        if node_status == NODE_STATUS.ACTIVE.value:
            self.start(current_time_str)

    # Start an allocated task 
    def start(self, current_time_str):
        self.status = TASK_STATUS.RUNNING.value
        self.start_time = current_time_str
    
    def end(self, end_status, current_time_str):
        self.status = end_status
        end_time = datetime.strptime(current_time_str, TIME_FORMAT)
        start_time = datetime.strptime(self.start_time, TIME_FORMAT)
        self.duration = (end_time - start_time).total_seconds()
        self.end_time = current_time_str

    def get_duration(self, current_time):
        if self.start_time != None:
            return (current_time - datetime.strptime(self.creation_time, TIME_FORMAT)).total_seconds()
        return None

    def set_live_duration(self, current_time):
        if self.check_status(TASK_STATUS.PENDING) or self.check_status(TASK_STATUS.RUNNING):
            self.duration = (current_time - datetime.strptime(self.creation_time, TIME_FORMAT)).total_seconds()
