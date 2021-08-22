const DistributorRole = artifacts.require('DistributorRole');

class EventTester {

  constructor() {
    this._eventPromise = new Promise((resolve, reject) => {
      this._eventResolver = resolve
      this._eventRejecter = reject
    });
  }

  async watchEvent(event) {
    await event.watch((err, res) => {
      if (err) {
        this._eventRejecter(err);
        return;
      }
      this._eventResolver(res);
    });
  }

  /**
   * example event response:
   *
   * {
        "logIndex": 0,
        "transactionIndex": 0,
        "transactionHash": "0x29b7612f5cb7b1c79b93c823ad1365e38d164abd6f1d0f6292935ee5af96a389",
        "blockHash": "0x0523a96a9f6d4049cd80f01ae2cfd9463eb18839ffcc959f03eca248620709a2",
        "blockNumber": 127,
        "address": "0x943a0afffa38c03ebfb852c5dc3f198b02a4f77e",
        "type": "mined",
        "removed": false,
        "event": "DistributorAdded",
        "args": {
          "account": "0x018c2dabef4904ecbd7118350a0c54dbeae3549a"
        }
      }
   */
  async getEmittedEventResponse(timeoutMillis = 5000) {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`getEmittedEventResponse timeout for ${timeoutMillis} milliseconds`))
      }, timeoutMillis);
    });
    return await Promise.race([this._eventPromise, timeoutPromise]);
  }
}

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
    const eventResponse = await eventTester.getEmittedEventResponse();
    const eventAccount = eventResponse.args.account;
    const eventName = eventResponse.event;
    assert.equal(eventAccount, distributor1);
    assert.equal(eventName, 'DistributorAdded');
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
    const eventResponse = await eventTester.getEmittedEventResponse();
    const eventAccount = eventResponse.args.account;
    const eventName = eventResponse.event;
    assert.equal(eventAccount, ownerAddress);
    assert.equal(eventName, 'DistributorRemoved');
  });
});
