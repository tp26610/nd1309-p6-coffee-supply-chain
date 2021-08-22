// import EventTester from '../EventTester';
const EventTester = require('../EventTester');
const ConsumerRole = artifacts.require('ConsumerRole');

contract('ConsumerRole', (accounts) => {

  let consumerRole;
  const ownerAddress = accounts[0];
  const consumer1 = accounts[1];

  beforeEach(async () => {
    consumerRole = await ConsumerRole.new();
  });

  it('is consumer for addresses added', async () => {
    assert.equal(await consumerRole.isConsumer(ownerAddress), true)
  });

  it('adds a consumer', async () => {
    // consumer1 is not a consumer
    assert.equal(await consumerRole.isConsumer(consumer1), false);

    await consumerRole.addConsumer(consumer1);

    assert.equal(await consumerRole.isConsumer(consumer1), true);
  });

  it('emits ConsumerAdded event', async () => {
    // consumer1 is not a consumer
    assert.equal(await consumerRole.isConsumer(consumer1), false);

    // listen event ConsumerAdded
    const eventTester = new EventTester();
    await eventTester.watchEvent(consumerRole.ConsumerAdded());

    await consumerRole.addConsumer(consumer1);

    // assert ConsumerAdded event emitted
    await eventTester.assertEvent('ConsumerAdded', { account: consumer1 });
  });

  it('renounces a consumer', async () => {
    await consumerRole.renounceConsumer();
    assert.equal(await consumerRole.isConsumer(ownerAddress), false);
  });

  it('emits ConsumerRemoved event', async () => {
    // listen event ConsumerAdded
    const eventTester = new EventTester();
    await eventTester.watchEvent(consumerRole.ConsumerRemoved());

    await consumerRole.renounceConsumer();

    // assert ConsumerAdded event emitted
    await eventTester.assertEvent('ConsumerRemoved', { account: ownerAddress });
  });
});
