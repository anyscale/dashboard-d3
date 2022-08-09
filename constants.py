from enum import Enum
from datetime import timedelta

TIME_FORMAT = "%Y-%m-%d %H:%M:%S"

class TASK_STATUS(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class NODE_STATUS(Enum):
    PENDING = "pending"
    ACTIVE = "active"
    TERMINATED = "terminated"
    FAILED = "failed"

class CPU_NODE_TYPE(Enum):
    NAME = "CPU node"
    CPU = 8 
    GPU = 0
    MEMORY = 64

class GPU_NODE_TYPE(Enum):
    NAME = "GPU node"
    CPU = 4
    GPU = 8
    MEMORY = 64

class RESOURCE_STATUS(Enum):
    PENDING = "pending"
    IDLE = "idle"
    ACTIVE = "active"

NODE_STARTUP_DELAY = timedelta(seconds=60)