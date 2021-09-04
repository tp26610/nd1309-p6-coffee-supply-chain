import supplyChainArtifact from '../../build/contracts/SupplyChain.json';
import $ from 'jquery';
import Web3 from 'web3';

const App = {
    web3Provider: null,
    contracts: {},
    emptyAddress: "0x0000000000000000000000000000000000000000",
    sku: 0,
    upc: 0,
    metamaskAccountID: "0x0000000000000000000000000000000000000000",
    ownerID: "0x0000000000000000000000000000000000000000",
    originFarmerID: "0x0000000000000000000000000000000000000000",
    originFarmName: null,
    originFarmInformation: null,
    originFarmLatitude: null,
    originFarmLongitude: null,
    productNotes: null,
    productPrice: 0,
    distributorID: "0x0000000000000000000000000000000000000000",
    retailerID: "0x0000000000000000000000000000000000000000",
    consumerID: "0x0000000000000000000000000000000000000000",

    init: async function () {
      console.log('>> init');
      this.readForm();
      await App.initWeb3();
      this.bindEvents();
      console.log('>> init done');
    },

    readForm: function () {
        App.sku = $("#sku").val();
        App.upc = $("#upc").val();
        App.ownerID = $("#ownerID").val();
        App.originFarmerID = $("#originFarmerID").val();
        App.originFarmName = $("#originFarmName").val();
        App.originFarmInformation = $("#originFarmInformation").val();
        App.originFarmLatitude = $("#originFarmLatitude").val();
        App.originFarmLongitude = $("#originFarmLongitude").val();
        App.productNotes = $("#productNotes").val();
        App.productPrice = $("#productPrice").val();
        App.distributorID = $("#distributorID").val();
        App.retailerID = $("#retailerID").val();
        App.consumerID = $("#consumerID").val();

        // console.log(
        //     App.sku,
        //     App.upc,
        //     App.ownerID, 
        //     App.originFarmerID, 
        //     App.originFarmName, 
        //     App.originFarmInformation, 
        //     App.originFarmLatitude, 
        //     App.originFarmLongitude, 
        //     App.productNotes, 
        //     App.productPrice, 
        //     App.distributorID, 
        //     App.retailerID, 
        //     App.consumerID
        // );
    },

    initWeb3: async function () {
      if (window.ethereum) {
        // use MetaMask's provider
        this.web3 = new Web3(window.ethereum);
        await window.ethereum.enable(); // get permission to access accounts
      } else {
        console.warn(
          'No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live'
        );
        // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
        this.web3 = new Web3(
          new Web3.providers.HttpProvider('http://127.0.0.1:8545')
        );
      }

      this.getMetaskAccountID();
      this.initSupplyChain();
    },

    getMetaskAccountID: function () {
        // Retrieving accounts
        this.web3.eth.getAccounts(function(err, res) {
            if (err) {
                console.log('Error:',err);
                return;
            }
            console.log('getMetaskID:',res);
            App.metamaskAccountID = res[0];

        })
    },

    initSupplyChain: async function() {
      try {
        // get contract instance
        console.log('initSupplyChain >>');
        const networkId = await this.web3.eth.net.getId();
        console.log('initSupplyChain >> networkId=', networkId);
        const deployedNetwork = supplyChainArtifact.networks[networkId];
        console.log('initSupplyChain >> deployedNetwork=', deployedNetwork);
        this.meta = new this.web3.eth.Contract(
          supplyChainArtifact.abi,
          deployedNetwork.address
        );
        console.log('initSupplyChain >> this.meta=', this.meta);

        // get accounts
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        console.log('initSupplyChain >> this.account=', this.account);
      } catch (error) {
        console.error('Could not connect to contract or chain. error=', error);
      }
    },

    bindEvents: function() {
        $(document).on('click', App.handleButtonClick);
    },

    handleButtonClick: async function(event) {
      console.log('handleButtonClick >> event=', event);
        event.preventDefault();

        App.getMetaskAccountID();

        var processId = parseInt($(event.target).data('id'));
        console.log('processId',processId);

        switch(processId) {
            case 1:
                return await App.harvestItem(event);
                break;
            case 2:
                return await App.processItem(event);
                break;
            case 3:
                return await App.packItem(event);
                break;
            case 4:
                return await App.sellItem(event);
                break;
            case 5:
                return await App.buyItem(event);
                break;
            case 6:
                return await App.shipItem(event);
                break;
            case 7:
                return await App.receiveItem(event);
                break;
            case 8:
                return await App.purchaseItem(event);
                break;
            case 9:
                return await App.fetchItemBufferOne(event);
                break;
            case 10:
                return await App.fetchItemBufferTwo(event);
                break;
            }
    },

    harvestItem: async function(event) {
      this.readForm();
      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      const { harvestItem } = this.meta.methods;
      console.log(`harvestItem >> input is upc=${this.upc}, originFarmerID=${this.metamaskAccountID}, originFarmName=${this.originFarmName}, originFarmInformation=${this.originFarmInformation}, originFarmLatitude=${this.originFarmLatitude}, originFarmLongitude=${this.originFarmLongitude}, productNotes=${this.productNotes}`);
      try {
        const result = await harvestItem(
          App.upc,
          App.metamaskAccountID,
          App.originFarmName,
          App.originFarmInformation,
          App.originFarmLatitude,
          App.originFarmLongitude,
          App.productNotes
        ).send({ from: this.metamaskAccountID});
        $("#farm-details-log").text(JSON.stringify(result, null, 2));
      } catch (e) {
        $("#farm-details-log").text(`error: ${e.message}`);
        console.error('harvestItem >> error=', e);
      }
    },

    processItem: async function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      const { processItem } = this.meta.methods;
      console.log(`processItem >> input upc=${this.upc}`);
      try {
        const result = await processItem(this.upc).send({ from: this.metamaskAccountID});
        $("#farm-details-log").text(JSON.stringify(result, null, 2));
        console.log(`processItem >> done`);
      } catch (e) {
        $("#farm-details-log").text(`error: ${e.message}`);
        console.error('processItem >> error=', e);
      }
    },

    packItem: async function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      const { packItem } = this.meta.methods;
      console.log(`packItem >> input upc=${this.upc}`);
      try {
        const result = await packItem(this.upc).send({ from: this.metamaskAccountID});
        $("#farm-details-log").text(JSON.stringify(result, null, 2));
        console.log(`packItem >> done`);
      } catch (e) {
        $("#farm-details-log").text(`error: ${e.message}`);
        console.error('packItem >> error=', e);
      }
    },

    sellItem: function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      App.contracts.SupplyChain.deployed().then(function(instance) {
          const productPrice = this.web3.toWei(1, "ether");
          console.log('productPrice',productPrice);
          return instance.sellItem(App.upc, App.productPrice, {from: App.metamaskAccountID});
      }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('sellItem',result);
      }).catch(function(err) {
          console.log(err.message);
      });
    },

    buyItem: function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      App.contracts.SupplyChain.deployed().then(function(instance) {
          const walletValue = this.web3.toWei(3, "ether");
          return instance.buyItem(App.upc, {from: App.metamaskAccountID, value: walletValue});
      }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('buyItem',result);
      }).catch(function(err) {
          console.log(err.message);
      });
    },

    shipItem: function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.shipItem(App.upc, {from: App.metamaskAccountID});
      }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('shipItem',result);
      }).catch(function(err) {
          console.log(err.message);
      });
    },

    receiveItem: function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.receiveItem(App.upc, {from: App.metamaskAccountID});
      }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('receiveItem',result);
      }).catch(function(err) {
          console.log(err.message);
      });
    },

    purchaseItem: function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      App.contracts.SupplyChain.deployed().then(function(instance) {
          return instance.purchaseItem(App.upc, {from: App.metamaskAccountID});
      }).then(function(result) {
          $("#ftc-item").text(result);
          console.log('purchaseItem',result);
      }).catch(function(err) {
          console.log(err.message);
      });
    },

    fetchItemBufferOne: async function () {
      this.readForm();

      console.log('fetchItemBufferOne >> upc=',this.upc);

      const { fetchItemBufferOne } = this.meta.methods;

      try {
        const result = await fetchItemBufferOne(this.upc).call();
        console.log('fetchItemBufferOne done >> result=', result);

        $("#product-overview-log").text(JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.log('fetchItemBufferOne error >> error=', error);
        throw error;
      }
    },

    fetchItemBufferTwo: async function () {
      this.readForm();
      console.log('fetchItemBufferTwo >> upc=',this.upc);

      const { fetchItemBufferTwo } = this.meta.methods;

      try {
        const result = await fetchItemBufferTwo(this.upc).call();
        console.log('fetchItemBufferTwo done >> result=', result);

        $("#product-overview-log").text(JSON.stringify(result, null, 2));
        return result;
      } catch (error) {
        console.log('fetchItemBufferTwo error >> error=', error);
        throw error;
      }
    },

    fetchEvents: function () {
        if (typeof App.contracts.SupplyChain.currentProvider.sendAsync !== "function") {
            App.contracts.SupplyChain.currentProvider.sendAsync = function () {
                return App.contracts.SupplyChain.currentProvider.send.apply(
                App.contracts.SupplyChain.currentProvider,
                    arguments
              );
            };
        }

        App.contracts.SupplyChain.deployed().then(function(instance) {
        var events = instance.allEvents(function(err, log){
          if (!err)
            $("#ftc-events").append('<li>' + log.event + ' - ' + log.transactionHash + '</li>');
        });
        }).catch(function(err) {
          console.log(err.message);
        });
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
