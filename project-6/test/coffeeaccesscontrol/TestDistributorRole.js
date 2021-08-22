// import EventTester from '../EventTester';
const EventTester = require('../EventTester');
const DistributorRole = artifacts.require('DistributorRole');

contract('DistributorRole', (accounts) => {

  let distributorRole;
  const ownerAddress = accounts[0];
  const distributor1 = accounts[1];

  beforeEach(async () => {
    distributorRole = await DistributorRole.new();
  });

  it('is distributor for addresses added', async () => {
    assert.equal(await distributorRole.isDistributor(ownerAddress), true)
  });

  it('adds a distributor', async () => {
    // distributor1 is not a distributor
    assert.equal(await distributorRole.isDistributor(distributor1), false);

    await distributorRole.addDistributor(distributor1);

    assert.equal(await distributorRole.isDistributor(distributor1), true);
  });

  it('emits DistributorAdded event', async () => {
    // distributor1 is not a distributor
    assert.equal(await distributorRole.isDistributor(distributor1), false);

    // listen event DistributorAdded
    const eventTester = new EventTester();
    await eventTester.watchEvent(distributorRole.DistributorAdded());

    await distributorRole.addDistributor(distributor1);

    // assert DistributorAdded event emitted
    await eventTester.assertEvent('DistributorAdded', { account: distributor1 });
  });

  it('renounces a distributor', async () => {
    await distributorRole.renounceDistributor();
    assert.equal(await distributorRole.isDistributor(ownerAddress), false);
  });

  it('emits DistributorRemoved event', async () => {
    // listen event DistributorAdded
    const eventTester = new EventTester();
    await eventTester.watchEvent(distributorRole.DistributorRemoved());

    await distributorRole.renounceDistributor();

    // assert DistributorAdded event emitted
    await eventTester.assertEvent('DistributorRemoved', { account: ownerAddress });
  });
});
