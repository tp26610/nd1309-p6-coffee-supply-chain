// import EventTester from '../EventTester';
const EventTester = require('../EventTester');
const FarmerRole = artifacts.require('FarmerRole');

contract('FarmerRole', (accounts) => {

  let farmerRole;
  const ownerAddress = accounts[0];
  const farmer1 = accounts[1];

  beforeEach(async () => {
    farmerRole = await FarmerRole.new();
  });

  it('is farmer for addresses added', async () => {
    assert.equal(await farmerRole.isFarmer(ownerAddress), true)
  });

  it('adds a farmer', async () => {
    // farmer1 is not a farmer
    assert.equal(await farmerRole.isFarmer(farmer1), false);

    await farmerRole.addFarmer(farmer1);

    assert.equal(await farmerRole.isFarmer(farmer1), true);
  });

  it('emits FarmerAdded event', async () => {
    // farmer1 is not a farmer
    assert.equal(await farmerRole.isFarmer(farmer1), false);

    // listen event FarmerAdded
    const eventTester = new EventTester();
    await eventTester.watchEvent(farmerRole.FarmerAdded());

    await farmerRole.addFarmer(farmer1);

    // assert FarmerAdded event emitted
    await eventTester.assertEvent('FarmerAdded', { account: farmer1 });
  });

  it('renounces a farmer', async () => {
    await farmerRole.renounceFarmer();
    assert.equal(await farmerRole.isFarmer(ownerAddress), false);
  });

  it('emits FarmerRemoved event', async () => {
    // listen event FarmerAdded
    const eventTester = new EventTester();
    await eventTester.watchEvent(farmerRole.FarmerRemoved());

    await farmerRole.renounceFarmer();

    // assert FarmerAdded event emitted
    await eventTester.assertEvent('FarmerRemoved', { account: ownerAddress });
  });
});
