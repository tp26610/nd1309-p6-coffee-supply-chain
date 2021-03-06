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
    productPriceInEhter: '0',
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
        App.productPriceInEhter = $("#productPrice").val();
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

        // subscribe events
        App.fetchEvents();
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
      console.log('handleButtonClick >> processId=', processId);

      switch(processId) {
        case 1:
          await App.harvestItem(event);
          break;
        case 2:
          await App.processItem(event);
          break;
        case 3:
          await App.packItem(event);
          break;
        case 4:
          await App.sellItem(event);
          break;
        case 5:
          await App.buyItem(event);
          break;
        case 6:
          await App.shipItem(event);
          break;
        case 7:
          await App.receiveItem(event);
          break;
        case 8:
          await App.purchaseItem(event);
          break;
        case 9:
          await App.fetchItemBufferOne(event);
          break;
        case 10:
          await App.fetchItemBufferTwo(event);
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

    sellItem: async function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      const { sellItem } = this.meta.methods;
      console.log(`sellItem >> input upc=${this.upc} productPriceInEhter=${this.productPriceInEhter} ether`);
      try {
        const productPriceInWei = this.web3.utils.toWei(this.productPriceInEhter, "ether");
        console.log('sellItem >> productPriceInWei',productPriceInWei, ' type=', typeof productPriceInWei);
        const result = await sellItem(this.upc, productPriceInWei).send({ from: this.metamaskAccountID});
        $("#farm-details-log").text(JSON.stringify(result, null, 2));
        console.log(`sellItem >> done`);
      } catch (e) {
        $("#farm-details-log").text(`error: ${e.message}`);
        console.error('sellItem >> error=', e);
      }
    },

    buyItem: async function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      const { buyItem } = this.meta.methods;
      console.log(`buyItem >> input upc=${this.upc}`);
      try {
        const productPriceInWei = this.web3.utils.toWei(this.productPriceInEhter, "ether");
        // console.log('buyItem >> walletValue=', walletValue);
        const result = await buyItem(this.upc).send({ from: this.metamaskAccountID, value: productPriceInWei});
        $("#product-details-log").text(JSON.stringify(result, null, 2));
        console.log(`buyItem >> done`);
      } catch (e) {
        $("#product-details-log").text(`error: ${e.message}`);
        console.error('buyItem >> error=', e);
      }
    },

    shipItem: async function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      const { shipItem } = this.meta.methods;
      console.log(`shipItem >> input upc=${this.upc}`);
      try {
        const result = await shipItem(this.upc).send({ from: this.metamaskAccountID });
        $("#product-details-log").text(JSON.stringify(result, null, 2));
        console.log(`shipItem >> done`);
      } catch (e) {
        $("#product-details-log").text(`error: ${e.message}`);
        console.error('shipItem >> error=', e);
      }
    },

    receiveItem: async function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      const { receiveItem } = this.meta.methods;
      console.log(`receiveItem >> input upc=${this.upc}`);
      try {
        const result = await receiveItem(this.upc).send({ from: this.metamaskAccountID });
        $("#product-details-log").text(JSON.stringify(result, null, 2));
        console.log(`receiveItem >> done`);
      } catch (e) {
        $("#product-details-log").text(`error: ${e.message}`);
        console.error('receiveItem >> error=', e);
      }
    },

    purchaseItem: async function (event) {
      this.readForm();

      event.preventDefault();
      var processId = parseInt($(event.target).data('id'));

      const { purchaseItem } = this.meta.methods;
      console.log(`purchaseItem >> input upc=${this.upc}`);
      try {
        const result = await purchaseItem(this.upc).send({ from: this.metamaskAccountID });
        $("#product-details-log").text(JSON.stringify(result, null, 2));
        console.log(`purchaseItem >> done`);
      } catch (e) {
        $("#product-details-log").text(`error: ${e.message}`);
        console.error('purchaseItem >> error=', e);
      }
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

    fetchEvents: async function () {
      this.meta.events.allEvents((err, event) => {
        console.log('fetchEvents result >> event=', event);
        if (!err) $("#ftc-events").append('<li>' + event.event + ' - ' + event.transactionHash + '</li>');
      });
    }
};

$(function () {
    $(window).load(function () {
        App.init();
    });
});
