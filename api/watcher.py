from watchgod import run_process
from importlib import import_module

def run_main():
    app = import_module('app')
    app.main()

run_process('.', run_main)