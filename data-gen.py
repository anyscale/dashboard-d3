from copyreg import constructor
from pstats import Stats
import sched
from time import strftime
import uuid
from datetime import datetime, timedelta
import random
import json
import math
from node import Node
from task import Task
from constants import CPU_NODE_TYPE, GPU_NODE_TYPE, NODE_STATUS, TASK_STATUS

NODE_STARTUP_DELAY = timedelta(seconds=60)

P_NEW_TASK = 1/200

TIME_FORMAT = "%Y-%m-%d %H:%M:%S"
# Remember to update the hard coded timelines in the frontend to mathc these ('src/app/consts.ts')
BASE_TIME_STR = "2022-07-27 09:08:07"
NOW_TIME_STR = "2022-07-28 13:15:17"

BASE_TIME = datetime.strptime(BASE_TIME_STR, TIME_FORMAT)
NOW_TIME = datetime.strptime(NOW_TIME_STR, TIME_FORMAT)

# Don't terminate tasks shorter than this amount in seconds
MIN_TASK_DURATION = 180

# Terminate nodes that have been idle
MAX_NODE_IDLE_DURATION = 180

TASK_STATUSES = [TASK_STATUS.RUNNING.value, TASK_STATUS.COMPLETED.value, TASK_STATUS.FAILED.value]

meta = {"start_time": BASE_TIME_STR, "end_time": NOW_TIME_STR}
nodes = {}
tasks = {}

# Randomly start new tasks
def random_event(p):
    return random.random() <= p

# Randomly change task status
def random_task_status():
    return random.choices(TASK_STATUSES, weights=[100000, 8, 1])[0]

def main():

    # Create nodes timeline based on the task timelines
    cluster_live_span = math.floor((NOW_TIME - BASE_TIME).total_seconds())
    for second in range(cluster_live_span):
        current_time = (BASE_TIME + timedelta(seconds=second))
        current_time_str = current_time.strftime(TIME_FORMAT)

        # Simulate tasks
        # At any point in time, there are some possible events
        # New task: p=1/36
        # Task finished: p=1/40
        # Task failed: p=1/1000
        #
        # Autoscaler will react based on the task events
        # - Not enough active + pending nodes --> start a new one and allocate task on it
        # - Node has no task on it --> shut it down
        # - Update cluster timeline

        # See if any nodes have finished pending 
        # If so, start any tasks that are scheduled on this node
        for node_id, node in nodes.items():
            task_ids = node.update_pending_node(current_time)
            if (len(task_ids) > 0):
                for task_id in task_ids:
                    print('Starting task %s on node %s' % (task_id, node_id))
                    tasks[task_id].start(current_time_str)

        # randomly change some running tasks to completed or failed
        # and free up their node resources
        for task_id, task in tasks.items():
            if task.check_status(TASK_STATUS.RUNNING.value) and task.get_duration(current_time) > MIN_TASK_DURATION:
                new_status = random_task_status()
                if new_status == TASK_STATUS.COMPLETED.value or new_status == TASK_STATUS.FAILED.value:
                    task.end(new_status, current_time_str)
                    host_node = nodes[task.allocated_node_id]
                    host_node.remove_task(task, current_time_str)

        # Generate and allocate new tasks
        # Tasks are sized so that they can be scheduled on a single node
        new_tasks = []
        if second == 0:
            # Start some tasks immediately at the beginning
            for i in range(4):
                new_tasks.append(Task(random.randint(1, 4),
                             random.randint(0, 4), current_time_str))

        # Start new tasks in pending status
        if random_event(P_NEW_TASK):
            new_tasks.append(Task(random.randint(1, 4),
                            random.randint(0, 4), current_time_str))
        if len(new_tasks) > 0:
            print("%d new task at %s" % (len(new_tasks), current_time_str))

        for task in new_tasks:
            assigned = False
            # Can the task be allocated to an existing node
            for node_id, node in nodes.items():
                if node.check_free_resources(task.CPU_demand, task.GPU_demand):
                    node.allocate_for_task(task, current_time_str)
                    task.assign_to_node(node.id, node.status, current_time_str)
                    assigned = True
                    break
            # If not, start new nodes and assign
            if assigned == False:
                if task.GPU_demand > 0:
                    new_node = Node(GPU_NODE_TYPE, current_time_str)
                else:
                    new_node = Node(CPU_NODE_TYPE, current_time_str)
                new_node.allocate_for_task(task, current_time_str)
                task.assign_to_node(new_node.id, new_node.status, current_time_str)
                nodes[new_node.id] = new_node

            tasks[task.id] = task

        # Shutdown any node that has been sitting in idle
        for node_id, node in nodes.items():
            if node.is_idle(MAX_NODE_IDLE_DURATION, current_time):
                node.terminate(current_time_str)

        # Generate some mock node CPU/GPU utilization timeseries every 30s
        if second % 60 == 0:
            for node_id, node in nodes.items():
                if node.check_status(NODE_STATUS.PENDING) or node.check_status(NODE_STATUS.ACTIVE):
                    node.generate_utilization_data(current_time_str)

    # Calculate all the durations before writing to file
    for node_id, node in nodes.items():
        node.set_live_duration(NOW_TIME)
    for task_id, task in tasks.items():
        task.set_live_duration(NOW_TIME)

    # Write to files
    with open("src/assets/meta.json", "w") as meta_file:
        json.dump(meta, meta_file)

    with open("src/assets/tasks.json", "w") as tasks_file:
        json.dump([task.__dict__ for task_id, task in tasks.items()], tasks_file)

    with open("src/assets/nodes.json", "w") as nodes_file:
        json.dump([node.__dict__ for node_id, node in nodes.items()], nodes_file)

    print("Generated %d tasks and %d nodes" % (len(tasks), len(nodes)))
if __name__ == "__main__":
    main()