from algopy import ARC4Contract
from algopy.arc4 import abimethod, String


class SolyrixAlgorand(ARC4Contract):
    @abimethod()
    def hello(self, name: String) -> String:
        return "Hello, " + name
