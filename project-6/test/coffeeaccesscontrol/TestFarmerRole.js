const FarmerRole = artifacts.require('FarmerRole');

contract('FarmerRole', (accounts) => {

  const ownerAddress = accounts[0];
  const farmer1 = accounts[1];

  it('is farmer for addresses added', async () => {
    const farmerRole = await FarmerRole.deployed();
    assert.equal(await farmerRole.isFarmer(ownerAddress), true)
  });

  it('adds a farmer', async () => {
    const farmerRole = await FarmerRole.deployed();

    // farmer1 is not a farmer
    assert.equal(await farmerRole.isFarmer(farmer1), false);

    await farmerRole.addFarmer(farmer1);

    assert.equal(await farmerRole.isFarmer(farmer1), true);
  });

  it('renounces a farmer', async () => {
    const farmerRole = await FarmerRole.deployed();
    await farmerRole.renounceFarmer();
    assert.equal(await farmerRole.isFarmer(ownerAddress), false);
  });
});
