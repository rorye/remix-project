import "remix_tests.sol"; // this import is automatically injected by Remix.

contract AssertGreaterThanTest {

    function greaterThanUintPassTest() public {
        Assert.greaterThan(uint(5), uint(2), "greaterThanUintPassTest passes");
    }

    function greaterThanUintFailTest() public {
        Assert.greaterThan(uint(1), uint(4), "greaterThanUintFailTest fails");
    }

    function greaterThanIntPassTest() public {
        Assert.greaterThan(int(-1), int(-2), "greaterThanIntPassTest passes");
    }

    function greaterThanIntFailTest() public {
        Assert.greaterThan(int(-1), int(1), "greaterThanIntFailTest fails");
    }
}