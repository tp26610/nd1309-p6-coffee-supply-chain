// import EventTester from '../EventTester';
const EventTester = require('../EventTester');
const RetailerRole = artifacts.require('RetailerRole');

contract('RetailerRole', (accounts) => {

  let retailerRole;
  const ownerAddress = accounts[0];
  const retailer1 = accounts[1];

  beforeEach(async () => {
    retailerRole = await RetailerRole.new();
  });

  it('is retailer for addresses added', async () => {
    assert.equal(await retailerRole.isRetailer(ownerAddress), true)
  });

  it('adds a retailer', async () => {
    // retailer1 is not a retailer
    assert.equal(await retailerRole.isRetailer(retailer1), false);

    await retailerRole.addRetailer(retailer1);

    assert.equal(await retailerRole.isRetailer(retailer1), true);
  });

  it('emits RetailerAdded event', async () => {
    // retailer1 is not a retailer
    assert.equal(await retailerRole.isRetailer(retailer1), false);

    // listen event RetailerAdded
    const eventTester = new EventTester();
    await eventTester.watchEvent(retailerRole.RetailerAdded());

    await retailerRole.addRetailer(retailer1);

    // assert RetailerAdded event emitted
    await eventTester.assertEvent('RetailerAdded', { account: retailer1 });
  });

  it('renounces a retailer', async () => {
    await retailerRole.renounceRetailer();
    assert.equal(await retailerRole.isRetailer(ownerAddress), false);
  });

  it('emits RetailerRemoved event', async () => {
    // listen event RetailerAdded
    const eventTester = new EventTester();
    await eventTester.watchEvent(retailerRole.RetailerRemoved());

    await retailerRole.renounceRetailer();

    // assert RetailerAdded event emitted
    await eventTester.assertEvent('RetailerRemoved', { account: ownerAddress });
  });
});
