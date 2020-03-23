blockchainRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"D:\\Catalin\\Munca\\privatesky\\builds\\tmp\\blockchain_intermediar.js":[function(require,module,exports){
(function (global){
global.blockchainLoadModules = function(){ 

	if(typeof $$.__runtimeModules["source-map-support"] === "undefined"){
		$$.__runtimeModules["source-map-support"] = require("source-map-support");
	}

	if(typeof $$.__runtimeModules["source-map"] === "undefined"){
		$$.__runtimeModules["source-map"] = require("source-map");
	}

	if(typeof $$.__runtimeModules["buffer-from"] === "undefined"){
		$$.__runtimeModules["buffer-from"] = require("buffer-from");
	}

	if(typeof $$.__runtimeModules["blockchain"] === "undefined"){
		$$.__runtimeModules["blockchain"] = require("blockchain");
	}
};
if (false) {
	blockchainLoadModules();
}
global.blockchainRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("blockchain");
}
require('source-map-support').install({});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"blockchain":"blockchain","buffer-from":"buffer-from","source-map":"source-map","source-map-support":"source-map-support"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\OBFTImplementation.js":[function(require,module,exports){
let pskcrypto = require("pskcrypto");
let fs = require("fs");

let consUtil = require("./transactionsUtil");



let detailedDebug = false;




let OBFTPSwarm = $$.flow.describe("OBFTProcess", {
    start: function (delegatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity, latency, votingBox) {

        this.lset = {}; // digest -> transaction - localy generated set of transactions (`createTransactionFromSwarm` stores each transaction; `beat` resets `lset`)
        /*this.dset = {}; // digest -> transaction - remotely delivered set of transactions that will be next participate in consensus
        this.pset = {}; // digest -> transaction - consensus pending set */

        this.CP = 0;
        this.CI = undefined;
        this.LAST = 0;
        this.TOP = this.LAST+2*latency;
        this.NEXT = this.TOP+latency;
        this.NTOP = this.TOP+2*latency;

        this.pulsesHistory = new PulseHistory();

        this.vsd = pdsAdapter.getHashLatestBlock();


        this.currentBlock = 0;
        this.nodeName               = delegatedAgentName;
        this.communicationOutlet    = communicationOutlet;
        this.pds                    = pdsAdapter;
        this.PP                     = pulsePeriodicity;
        this.LATENCY                = latency;
        this.votingBox              = votingBox;
        this.explictPhase           = "default"; /* default, boot, late, broken*/

        this.bootNode();
    },
    /*
    * @param {transaction}
    */
    receiveTransaction:function(t){
        this.lset[t.digest] = t;
    },
    /*
     * @param {}
    */
    sendPulse: function () {
        switch(this.explictPhase){
            case "boot": break;
            case "late": break;
            case "ntop": this.sendAtNTOP(); break;
            case "broken":this.whenBroken_HumanInterventionIsRequired(); break
            default:
                if(this.CP <= this.TOP) this.sendUntilTOP(); else
                if(this.CP < this.NEXT) this.sendUntilNEXT(); else
                if(this.CP == this.NEXT) this.sendAtNEXT(); else
                if(this.CP < this.NTOP) this.sendUntilNTOP(); else
                if(this.CP == this.NTOP) this.sendAtNTOP(); else
                    console.log("Should not happen");
        }
        setTimeout(this.sendPulse, this.PP);   //self invocation of the phase
    },
    /*
     * @param {}
    */
    sendUntilTOP: function () {
        communicationOutlet.newPulse()
    },
    /*
     * @param {}
    */
    sendUntilNEXT: function () {

    },
    /*
     * @param {}
    */
    sendAtNEXT: function () {

    },
    /*
     * @param {}
    */
    sendUntilNTOP: function () {

    },
    /*
     * @param {}
    */
    sendAtNTOP: function () {

    },
    /*
     * @param {}
    */
    whenSlowNode: function () {

    },
    /*
     * @param {}
    */
    whenSlowNetwork: function () {

    },
    /*
     * @param {}
    */
    whenBroken_HumanInterventionIsRequired: function () {

    },
    /*
     * @param {pulse}
    */
    receivePulse:function(pulse){

    },
    /*
     * @param {}
    */
    bootNode: function () {
        this.explictPhase = "BOOT";
    },
     /*
     * @param {Pulse} pulse e.g. new Pulse(this.nodeName, this.currentPulse, ......)
     */
    recordPulse: function (pulse) {
    },
    /*
         * @param {}
        */
    requestMissingPulse: function () {

    }
});


/**
 * @param {String} delegatedAgentName e.g. 'Node 0', or 'agent_007'
 * @param {Object} communicationOutlet e.g. object to be used in phase `beat` of the returned "pulseSwarm" flow
 *  - it should have a property: `broadcastPulse`: function(from, pulse) {...}
 *      - {String} `from` e.g. `delegatedAgentName`
 *      - {Pulse} `pulse` (see 'transactionsUtil.js')
 * @param {InMemoryPDS} pdsAdapter e.g. require("pskdb/lib/InMemoryPDS").newPDS(null);
 * @param {Number} pulsePeriodicity e.g. 300
 * 
 * @returns {SwarmDescription} A new instance of "pulseSwarm" flow, with phase `start` already running
 */
exports.createConsensusManager = function (delegatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity, votingBox) {
    let instance = pulseSwarm();
    instance.start(delegatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity, votingBox);
    return instance;
}

},{"./transactionsUtil":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\transactionsUtil.js","fs":false,"pskcrypto":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\PulseUtil.js":[function(require,module,exports){
function PulseUtil(signer, currentPulseNumber, block, newTransactions, vsd, top, last) {
    this.signer         = signer;               //a.k.a. delegatedAgentName
    this.currentPulse   = currentPulseNumber;
    this.lset           = newTransactions;      //digest -> transaction
    this.ptBlock        = block;                //array of digests
    this.vsd            = vsd;
    this.top            = top;                  // a.k.a. topPulseConsensus
    this.last           = last;                 // a.k.a. lastPulseAchievedConsensus
}


module.exports.createPulse = function (signer, CP, CI, lset, top, last) {
    return new PulseUtil(signer, CP, CI, lset, vsd, top, last);
}


function PulseHistory(){

}

module.exports.createPulseHistory = function () {
    return new PulseHistory();
}
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\transactionsUtil.js":[function(require,module,exports){
/*
consensus helper functions when working with transactions
*/

let  pskcrypto = require("pskcrypto");


module.exports.orderCRTransactions = function (pset) { //order in place the pset array
    var arr = [];
    for (let d in pset) {
        arr.push(pset[d]);
    }

    arr.sort(function (t1, t2) {
        if (t1.transactionPulse < t2.transactionPulse) return -1;
        if (t1.transactionPulse > t2.transactionPulse) return 1;
        if (t1.second < t2.second) return -1;
        if (t1.second > t2.second) return 1;
        if (t1.nanosecod < t2.nanosecod) return -1;
        if (t1.nanosecod > t2.nanosecod) return 1;
        if (t1.digest < t2.digest) return -1;
        if (t1.digest > t2.digest) return 1;
        return 0; //only for identical transactions...
    })
    return arr;
}

},{"pskcrypto":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\blockchainSwarmTypes\\asset_swarm_template.js":[function(require,module,exports){
var CNST = require("../moduleConstants");

exports.createForObject = function(valueObject, thisObject, localId){
	var callflowModule = require("callflow");
	var ret = callflowModule.createStandardAPIsForSwarms(valueObject, thisObject, localId);

	ret.swarm           = null;
	ret.onReturn        = null;
	ret.onResult        = null;
	ret.asyncReturn     = null;
	ret.return          = null;
	ret.home            = null;

	ret.autoInit        = function(blockchain){
		if(!blockchain) {
			$$.warn("Initialisation asset outside of a blockchain context");
			return;
		}
		let sp = thisObject.getMetadata(CNST.SECURITY_PARADIGM);
		thisObject.securityParadigm = blockchain.getSPRegistry().getSecurityParadigm(thisObject);
		if(sp == undefined){
			let ctor = valueObject.myFunctions[CNST.CTOR];
			if(ctor){
				ctor.apply(thisObject);
			}
		}
	};

	ret.getSwarmId = function(){
		return 	thisObject.getMetadata(CNST.SWARMID);
	};

	ret.getSwarmType = function(){
		return 	thisObject.getMetadata(CNST.SWARMTYPE);
	};

	ret.__reinit = function(blockchain){
		ret.autoInit(blockchain);
	};

	ret.asJSON = function(){
		return thisObject.getInnerValue().publicVars;
	};

	return ret;
};
},{"../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js","callflow":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\blockchainSwarmTypes\\transaction_swarm_template.js":[function(require,module,exports){
let CNST = require("../moduleConstants");

exports.createForObject = function(valueObject, thisObject, localId){
	let callflowModule = require("callflow");

	let _blockchain = undefined;
	let ret = callflowModule.createStandardAPIsForSwarms(valueObject, thisObject, localId);
	ret.swarm           = null;
	ret.onReturn        = null;
	ret.onResult        = null;
	ret.asyncReturn     = null;
	ret.autoInit        = function(blockchain){
		_blockchain = blockchain;
		thisObject.transaction = blockchain.beginTransaction(thisObject);
	};

	ret.commit = function () {
		_blockchain.commit(thisObject.transaction, (error, status) => {
			thisObject.transaction.getSwarm().notify({eventType: "commit", error, status});
		});
	};

	ret.onCommit = function (callback) {
		thisObject.observe((event) => {
			callback(event.error, event.status);
		}, undefined, (event)=>{
			return event.eventType === "commit";
		});
	};

	ret.onReturn = function (callback) {
		thisObject.observe((event) => {
			callback(event.error, event.result);
		}, undefined, (event)=>{
			return event.eventType === "return";
		});
	};

	ret.return = function(error, result){
		thisObject.notify({eventType: "return", error, result});
	};

	ret.home = ret.return;

	return ret;
};
},{"../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js","callflow":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\ACLScope.js":[function(require,module,exports){

$$.asset.describe("ACLScope", {
    public:{
        concern:"string:key",
        db:"json"
    },
    init:function(concern){
        this.concern = concern;
    },
    addResourceParent : function(resourceId, parentId){

    },
    addZoneParent : function(zoneId, parentId){

    },
    grant :function(agentId,  resourceId){

    },
    allow :function(agentId,  resourceId){
        return true;
    }
});
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\Agent.js":[function(require,module,exports){

$$.asset.describe("Agent", {
    public:{
        alias:"string:key",
        publicKey:"string"
    },
    init:function(alias, value){
        this.alias      = alias;
        this.publicKey  = value;
    },
    update:function(value){
        this.publicKey = value;
    },
    addAgent: function () {
        throw new Error('Not Implemented');
    },
    listAgent: function () {
        throw new Error('Not Implemented');

    },
    removeAgent: function () {
        throw new Error('Not Implemented');

    }
});
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\Backup.js":[function(require,module,exports){

$$.asset.describe("Backup", {
    public:{
        id:  "string",
        url: "string"
    },

    init:function(id, url){
        this.id = id;
        this.url = url;
    }
});

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\BarAnchor.js":[function(require,module,exports){
$$.asset.describe("BarAnchor", {
    public: {
        alias: "string",
        mountPoint: "string",
        barMapDigest: "string",
        readList: "array", //encrypted seeds with public keys
        writeList: "array", //agentIds
    },
    init: function (mountPoint, barMapDigest) {
        this.mountPoint = mountPoint;
        this.barMapDigest = barMapDigest;
    },
    updateReadList: function (encryptedSeed) {
        if (!this.readList) {
            this.readList = [];
        }
        this.readList.push(encryptedSeed);
    },
    updateWriteList: function (agentId) {
        if (!this.writeList) {
            this.writeList = [];
        }

        this.writeList.push(agentId);
    }
});
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\CSBMeta.js":[function(require,module,exports){

$$.asset.describe("CSBMeta", {
	public:{
		isMaster:"string",
		alias:"string:key",
		description: "string",
		creationDate: "string",
		updatedDate : "string",
		id: "string",
		icon: "string"
	},
	init:function(id){
		this.alias = "meta";
		this.id = id;
	},

	setIsMaster: function (isMaster) {
		this.isMaster = isMaster;
	}

});

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\DomainConfig.js":[function(require,module,exports){

$$.asset.describe("DomainConfig", {
    public:{
        alias:"string:key",
        blockChainStorageFolderName:"",
        addresses: "map",
        communicationInterfaces: "map",
        workerStrategy: "string"
    },
    init:function(alias){
        this.alias = alias;
        this.addresses = {};
        this.communicationInterfaces = {};
        this.workerStrategy = 'threads';
    },
    updateDomainAddress:function(replicationAgent, address){
        if(!this.addresses){
            this.addresses = {};
        }
        this.addresses[replicationAgent] = address;
    },
    removeDomainAddress:function(replicationAgent){
        this.addresses[replicationAgent] = undefined;
        delete this.addresses[replicationAgent];
    },
    setBlockChainStorageFolderName: function(storageFolderName){
        this.blockChainStorageFolderName = storageFolderName;
    },
    getBlockChainStorageFolderName: function() {
        return this.blockChainStorageFolderName;
    },
    addCommunicationInterface(alias, virtualMQEndpoint, zeroMQEndpoint) {
        if (!this.communicationInterfaces) {
            this.communicationInterfaces = {};
        }
        this.communicationInterfaces[alias] = {virtualMQ: virtualMQEndpoint, zeroMQ: zeroMQEndpoint};
    },
    setWorkerStrategy: function(workerStrategy) {
        this.workerStrategy = workerStrategy;
    }
});
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\DomainReference.js":[function(require,module,exports){

$$.asset.describe("DomainReference", {
    public:{
        role:"string:index",
        alias:"string:key",
        constitution:"string",
        workspace:"string"
    },
    init:function(role, alias){
        this.role = role;
        this.alias = alias;
    },
    setConstitution:function(pathOrUrlOrCSB){
        this.constitution = pathOrUrlOrCSB;
    },
    getConstitution:function(){
        return this.constitution;
    },
    setWorkspace:function(path){
        this.workspace = path;
    },
    getWorkspace:function(){
        return this.workspace;
    }
});
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\FileAnchor.js":[function(require,module,exports){
$$.asset.describe("FileAnchor", {
    public: {
        alias: "string",
        type: "string",
        seed: "string",
        digest: "string", //csb digest after file addition
        readList: "array", //encrypted seeds with public keys
        writeList: "array", //agentIds
    },
    init: function (alias, type, seed, digest) {
        this.alias = alias;
        this.type = type;
        this.seed = seed;
        this.digest = digest;
    }
});


},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\Key.js":[function(require,module,exports){

$$.asset.describe("key", {
    public:{
        alias:"string"
    },
    init:function(alias, value){
        this.alias = alias;
        this.value = value;
    },
    update:function(value){
        this.value = value;
    }
});
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\index.js":[function(require,module,exports){
module.exports = $$.library(function(){
    require("./DomainReference");
    require("./DomainConfig");
    require("./Agent");
    require("./Backup");
    require("./ACLScope");
    require("./Key");
    require("../transactions/transactions");
    require("./BarAnchor");
    require("./FileAnchor");
    require('./CSBMeta');
});
},{"../transactions/transactions":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\transactions.js","./ACLScope":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\ACLScope.js","./Agent":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\Agent.js","./Backup":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\Backup.js","./BarAnchor":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\BarAnchor.js","./CSBMeta":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\CSBMeta.js","./DomainConfig":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\DomainConfig.js","./DomainReference":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\DomainReference.js","./FileAnchor":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\FileAnchor.js","./Key":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\Key.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\swarms\\index.js":[function(require,module,exports){
if($$.swarms){
    $$.swarms.describe("transactionHandler", {
        start: function (identity, transactionName, methodName, ...args) {
            let transaction = $$.blockchain.startTransactionAs(identity, transactionName, methodName, ...args);
            transaction.onReturn((err, result) => {
                this.return(err, result);
            });
        }
    });
}

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\agentTransaction.js":[function(require,module,exports){
const sharedPhases = require('./sharedPhases');

$$.transaction.describe("Agents", {
    add: function (alias, publicKey) {
        let agent = $$.blockchain.lookup("Agent", alias);
        if(!agent){
            agent = $$.asset.start("Agent", "init", alias, publicKey);
        }else{
            $$.exception(`Agent with ${alias} already exists!`);
        }

        this.transaction.add(agent);
        this.onCommit(()=>{
            this.return(undefined, agent.asJSON());
        });
        this.commit();
    },
    getAgents: sharedPhases.getAllAssetsFactory('global.Agent')
});

},{"./sharedPhases":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\sharedPhases.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\domainConfigTransaction.js":[function(require,module,exports){
const sharedPhases = require('./sharedPhases');

$$.transaction.describe("DomainConfigTransaction", {
    add: function (alias, communicationInterfaces, workerStrategy) {
        let domain = this.transaction.lookup("DomainConfig", alias);

        if(!domain){
            domain = this.transaction.createAsset("DomainConfig", "init", alias);
        }else{
            $$.exception(`Domain with ${alias} already exists!`);
        }

        if(typeof communicationInterfaces !== "undefined"){
            Object.keys(communicationInterfaces).forEach(commAlias => {
                const {virtualMQ, zeroMQ} = communicationInterfaces[commAlias];
                domain.addCommunicationInterface(commAlias, virtualMQ, zeroMQ);
            });
        }

        if(workerStrategy) {
            domain.setWorkerStrategy(workerStrategy);
        }

        this.transaction.add(domain);
        this.onCommit(()=>{
            this.return(undefined, domain.asJSON());
        });
        this.commit();
    },
    getDomainDetails: sharedPhases.getAssetFactory('global.DomainConfig'),
    getDomains: sharedPhases.getAllAssetsFactory('global.DomainConfig')
});

},{"./sharedPhases":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\sharedPhases.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\domainTransaction.js":[function(require,module,exports){
const sharedPhases = require('./sharedPhases');

$$.transaction.describe("Domain", {
    add: function (alias, role, workspace, constitution) {
        let domain = this.transaction.lookup("DomainReference", alias);

        if(!domain){
            domain = this.transaction.createAsset("DomainReference", "init", role, alias);
        }else{
            $$.exception(`Domain with ${alias} already exists!`);
        }

        if(typeof workspace !== "undefined"){
            domain.setWorkspace(workspace);
        }

        if(typeof constitution !== "undefined"){
            domain.setConstitution(constitution);
        }

        this.transaction.add(domain);
        this.onCommit(()=>{
            this.return(undefined, domain.asJSON());
        });
        this.commit();
    },
    connectDomainLocally: function(alias, localInterface){
        let domain = this.transaction.lookup("DomainReference", alias);
        domain.addLocalInterface('local', localInterface);

        this.transaction.add(domain);
        this.onCommit(()=>{
            this.return(undefined, domain.asJSON());
        });
        this.commit();
    },
    setWorkspaceForDomain: function(alias, workspace){
        let domain = this.transaction.lookup("DomainReference", alias);
        domain.setWorkspace(workspace);

        this.transaction.add(domain);
        this.onCommit(()=>{
            this.return(undefined, domain.asJSON());
        });
        this.commit();
    },
    setConstitutionForDomain: function(alias, constitution){
        let domain = this.transaction.lookup("DomainReference", alias);
        domain.setConstitution(constitution);

        this.transaction.add(domain);
        this.onCommit(()=>{
            this.return(undefined, domain.asJSON());
        });
        this.commit();
    },
    getDomainDetails:function(alias){
        let domain = this.transaction.lookup("DomainReference", alias);
        return domain.toJson();
    },
    connectDomainToRemote(domainName, alias, remoteEndPoint){
        let domain = this.transaction.lookup("DomainReference", domainName);
        domain.addRemoteInterface(alias, remoteEndPoint);

        this.transaction.add(domain);
        this.onCommit(()=>{
            this.return(undefined, domain.asJSON());
        });
        this.commit();
    },
    setWorkerStrategy: function (alias, workerStrategy) {
        const domainReference =  this.transaction.lookup("DomainReference", alias);
        if(!domainReference) {
            $$.exception(`Domain with alias ${alias} does not exist!`);
        }

        domainReference.setWorkerStrategy(workerStrategy);

        this.transaction.add(domainReference);
        this.onCommit(()=>{
            this.return(undefined, domainReference.asJSON());
        });
        this.commit();
    },
    setMaximumNumberOfWorkers: function (alias, maximumNumberOfWorkers) {
        const domainReference =  this.transaction.lookup("DomainReference", alias);
        if(!domainReference) {
            $$.exception(`Domain with alias ${alias} does not exist!`);
        }

        domainReference.setMaximumNumberOfWorkers(maximumNumberOfWorkers);

        this.transaction.add(domainReference);
        this.onCommit(()=>{
            this.return(undefined, domainReference.asJSON());
        });
        this.commit();
    },
    getDomainDetails: sharedPhases.getAssetFactory('global.DomainReference'),
    getDomains: sharedPhases.getAllAssetsFactory('global.DomainReference')
});

},{"./sharedPhases":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\sharedPhases.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\firstTransactionWorkaroundDeleteThis.js":[function(require,module,exports){
/**
 * FIXME
 * The first block in the blockchain is 0.
 * When creating a CSB, if only one transaction is committed (only one block written) then only the block 0
 * will be written and blocks/index will have the value 0
 * When loading again the CSB, the CSB's blockchain will replay transaction from pulse 0 until 0, currentPulse
 * remaining 0. When creating a new transaction, it will have pulse 0 again and the block 0 will be overwritten.
 *
 * This transaction's purpose is to always start the blockchain with at least one transaction so it will hopefully
 * write at least two blocks in the beginning
 */
$$.transaction.describe("TooShortBlockChainWorkaroundDeleteThis", {
    add: function () {
        this.onCommit(()=>{
            this.return();
        });
        this.commit();
    }
});
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\index.js":[function(require,module,exports){
require('./domainTransaction');
require('./agentTransaction');
require('./standardCSBTransactions');
require('./domainConfigTransaction');
require('./firstTransactionWorkaroundDeleteThis');
},{"./agentTransaction":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\agentTransaction.js","./domainConfigTransaction":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\domainConfigTransaction.js","./domainTransaction":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\domainTransaction.js","./firstTransactionWorkaroundDeleteThis":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\firstTransactionWorkaroundDeleteThis.js","./standardCSBTransactions":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\standardCSBTransactions.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\sharedPhases.js":[function(require,module,exports){
module.exports = {
    getAssetFactory: function(assetType) {
        return function(alias) {
            const transaction = $$.blockchain.beginTransaction({});
            const domainReferenceSwarm = transaction.lookup(assetType, alias);

            if(!domainReferenceSwarm) {
                this.return(new Error(`Could not find swarm named "${assetType}"`));
                return;
            }

            this.return(undefined, domainReferenceSwarm.asJSON());
        }
    },
    getAllAssetsFactory: function(assetType) {
        return function() {
            const transaction = $$.blockchain.beginTransaction({});
            const domains = transaction.loadAssets(assetType) || [];

            this.return(undefined, domains.map(domain => domain.asJSON()));
        };
    }
};
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\standardCSBTransactions.js":[function(require,module,exports){
$$.transaction.describe("StandardCSBTransactions", {
    addBarAnchor: function (mountPoint, barMapDigest) {
        this.transaction.createAsset("BarAnchor", "init", mountPoint, barMapDigest);
        this.commit();
    },

    addFileAnchor: function (alias, type, seed, digest) {
        try{
            let fileAnchor = this.transaction.createAsset("FileAnchor", "init", alias, type, seed, digest);

            this.onCommit(() => {
                this.return(undefined, fileAnchor.asJSON());
            });

            this.commit();

        }catch(e) {
            this.return(e.message);
        }
    },

    domainLookup: function(alias){
        try{
            let fileAnchor = this.transaction.lookup("FileAnchor", alias);
            this.return(undefined, fileAnchor ? fileAnchor.asJSON() : "");
        }catch(err){
            this.return(err.message);
        }
    },
    updateFileDigest: function (alias, digest) {
        const file = this.transaction.lookup("FileAnchor", alias);
        file.digest = digest;
        this.transaction.add(file);
        this.transaction.commit();
    },
    getSeed: function (alias) {
        try {
            const anchor = this.transaction.lookup("FileAnchor", alias);
            this.return(undefined, anchor.seed);
        } catch (e) {
            this.return(e.message);
        }
    }
});
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\transactions.js":[function(require,module,exports){
$$.transaction.describe("transactions", {
    updateKey: function (key, value) {
        var transaction = $$.blockchain.beginTransaction(this);
        var key = transction.lookup("Key", key);
        var keyPermissions = transaction.lookup("ACLScope", "KeysConcern");
        if (keyPermissions.allow(this.agentId, key)) {
            key.update(value);
            transaction.add(key);
            $$.blockchain.commit(transaction);
        } else {
            this.securityError("Agent " + this.agentId + " denied to change key " + key);
        }
    },
    addChild: function (alias) {
        var transaction = $$.blockchain.beginTransaction();
        var reference = $$.contract.start("DomainReference", "init", "child", alias);
        transaction.add(reference);
        $$.blockchain.commit(transaction);
    },
    addParent: function (value) {
        var reference = $$.contract.start("DomainReference", "init", "child", alias);
        this.transaction.save(reference);
        $$.blockchain.persist(this.transaction);
    },
    addAgent: function (alias, publicKey) {
        var reference = $$.contract.start("Agent", "init", alias, publicKey);
        this.transaction.save(reference);
        $$.blockchain.persist(this.transaction);
    },
    updateAgent: function (alias, publicKey) {
        let agent = this.transaction.lookup("Agent", alias);
        agent.update(publicKey);
        this.transaction.save(agent);
        $$.blockchain.persist(this.transaction);
    }
});


$$.newTransaction = function(transactionFlow,ctor,...args){
    var transaction = $$.swarm.start( transactionFlow);
    transaction.meta("agentId", $$.currentAgentId);
    transaction.meta("command", "runEveryWhere")
    transaction.meta("ctor", ctor);
    transaction.meta("args", args);
    transaction.sign();
    //$$.blockchain.sendForConsent(transaction);
    //temporary until consent layer is activated
    transaction[ctor].apply(transaction,args);
}

/*
usages:
    $$.newTransaction("domain.transactions", "updateKey", "key", "value")

 */

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js":[function(require,module,exports){
module.exports = {
    ALIAS:"alias",
    ALIASES : '/aliases',
    SECURITY_PARADIGM:"SecurityParadigm",
    RESTRICTED:"Restricted",
    CONSTITUTIONAL:"Constitutional",
    PREDICATIVE:"Predicative",
    CTOR:"ctor",
    COMMAND_ARGS:"COMMAND_ARGS",
    SIGNING_AGENT:"SIGNING_AGENT",
    INTIALISATION_CONTEXT:"intialisationContext",
    SWARMID:"swarmId",
    SWARMTYPE:"swarmTypeName"
};
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleExports.js":[function(require,module,exports){
module.exports = {
    createBlockchain:function(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, loadDefaultConstitution, forcedBoot){
        return require("./pskdb").startDefaultDB(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, loadDefaultConstitution, forcedBoot);
    },
    createABlockchain:function(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, loadDefaultConstitution, forcedBoot){
        return require("./pskdb").startDB(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, loadDefaultConstitution, forcedBoot);
    },
    createHistoryStorage:function(storageType,...args){
        return require("./strategies/historyStorages/historyStoragesRegistry").createStorage(storageType,...args);
    },
    createWorldStateCache:function(storageType,...args){
        return require("./strategies/worldStateCaches/worldStateCacheRegistry").createCache(storageType,...args);
    },
    createConsensusAlgorithm:function(name,...args){
        return require("./strategies/consensusAlgortims/consensusAlgoritmsRegistry").createAlgorithm(name,...args);
    },
    createCRTransaction:function (swarmType, command, input, output, currentPulse) {
        /*
            class for Command or Result transactions
        */
        function CRTransaction(swarmType, command, input, output, currentPulse) {
            var pskcrypto = require("pskcrypto");

            this.swarmType = swarmType;

            if(input && output){
                this.input      = input;
                this.output     = output;
            }
            this.command      = command;

            let arr = process.hrtime();
            this.second     = arr[0];
            this.nanosecod  = arr[1];
            this.transactionPulse = currentPulse;
            this.digest     = pskcrypto.hashValues(this);
        }

        return new CRTransaction(swarmType, command, input, output, currentPulse);
    },
    createBlock:function (blockset, pulse, previous) {
        let pskcrypt = require("pskcrypto");
        var block = {blockset, pulse, previous};
        block.hash = pskcrypt.hashValues(block);
        return block;
    },
    createSignatureProvider:function(name,...args){
        return require("./strategies/signatureProvidersRegistry/signatureProvidersRegistry").createSignatureProvider(name,...args);
    },
    createNetworkCommunicationStrategy:function(name,...args){
        return require("./strategies/networkCommunication/networkCommunicationStrategiesRegistry").createNetworkAdapter(name,...args);
    },
    createVotingStrategy:function(name,...args){
        return require("./strategies/votingStrategies/votingStrategiesRegistry").createVotingStrategy(name,...args);
    }
}
},{"./pskdb":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\index.js","./strategies/consensusAlgortims/consensusAlgoritmsRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\consensusAlgortims\\consensusAlgoritmsRegistry.js","./strategies/historyStorages/historyStoragesRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\historyStoragesRegistry.js","./strategies/networkCommunication/networkCommunicationStrategiesRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\networkCommunication\\networkCommunicationStrategiesRegistry.js","./strategies/signatureProvidersRegistry/signatureProvidersRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\signatureProvidersRegistry\\signatureProvidersRegistry.js","./strategies/votingStrategies/votingStrategiesRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\votingStrategies\\votingStrategiesRegistry.js","./strategies/worldStateCaches/worldStateCacheRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\worldStateCaches\\worldStateCacheRegistry.js","pskcrypto":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\Blockchain.js":[function(require,module,exports){
const bm = require('../moduleExports');
const beesHealer = require("swarmutils").beesHealer;
var CNST = require("../moduleConstants");

function AliasIndex(assetType, pdsHandler, worldStateCache) {
    this.create = function (alias, uid) {
        const assetAliases = this.getAliases();

        if (typeof assetAliases[alias] !== "undefined") {
            $$.exception(`Alias ${alias} for assets of type ${assetType} already exists`);
        }

        assetAliases[alias] = uid;

        worldStateCache.writeKey(assetType + CNST.ALIASES, J(assetAliases));
    };

    this.getUid = function (alias) {
        const assetAliases = this.getAliases();
        //console.log("assetAliases", assetAliases);
        return assetAliases[alias];
    };

    this.getAliases = function () {
        let aliases = worldStateCache.readKey(assetType + CNST.ALIASES);
        return aliases ? JSON.parse(aliases) : {};
    }
}

function createLoadAssets(blockchain, pdsHandler, worldStateCache) {
    return function (assetType) {
        assetType = $$.fixSwarmName(assetType);
        const assets = [];

        const aliasIndex = new AliasIndex(assetType, pdsHandler, worldStateCache);
        Object.keys(aliasIndex.getAliases()).forEach(alias => {
            assets.push(blockchain.lookup(assetType, alias));
        });

        return assets;
    };
}

function createLookup(blockchain, pdsHandler, SPRegistry, worldStateCache) {
    function hasAliases(spaceName) {
        let ret = !!worldStateCache.readKey(spaceName + CNST.ALIASES);
        return ret;
    }

    return function (assetType, aid) { // aid == alias or id

        let localUid = aid;
        assetType = $$.fixSwarmName(assetType);

        if (hasAliases(assetType)) {
            const aliasIndex = new AliasIndex(assetType, pdsHandler, worldStateCache);
            localUid = aliasIndex.getUid(aid) || aid;
        }

        const value = pdsHandler.readKey(assetType + '/' + localUid, true);

        if (!value) {
            $$.log("Lookup fail, asset not found: ", assetType, " with alias", aid, value);
            //pdsHandler.dump();
            //return $$.asset.start(assetType);
            return null;
        } else {
            const asset = $$.asset.continue(assetType, JSON.parse(value));
            asset.__reinit(blockchain);
            return asset;
        }
    };
}

function Blockchain(pskdb, consensusAlgorithm, worldStateCache, signatureProvider) {
    let spr = require("./securityParadigms/securityParadigmRegistry").getRegistry(this);
    let self = this;

    consensusAlgorithm.setPSKDB(pskdb);

    this.beginTransaction = function (transactionSwarm, handler) {
        if (!transactionSwarm) {
            $$.exception("Can't begin a transaction outside of a swarm instance from transactions namespace");
        }
        if (!handler) {
            handler = pskdb.getHandler();
        }
        return new Transaction(self, handler, transactionSwarm, worldStateCache, spr);
    };


    this.start = function (reportBootingFinishedCallback) {
        pskdb.initialise(function (err, res) {
            reportBootingFinishedCallback(err, self);
        });
    };


    this.lookup = function (assetType, aid) {
        let newLookup = createLookup(self, pskdb.getHandler(), spr, worldStateCache);
        return newLookup(assetType, aid);
    };

    this.loadAssets = createLoadAssets(self, pskdb.getHandler(), worldStateCache);

    this.getSPRegistry = function () {
        return spr;
    };

    this.signAs = function (agentId, msg) {
        return signatureProvider.signAs(agentId, msg);
    };

    this.verifySignature = function (msg, signatures) {
        return signatureProvider.verify(msg, signatures);
    };


    this.registerSecurityParadigm = function (SPName, apiName, factory) {
        return spr.register(SPName, apiName, factory);
    };


    this.startCommandAs = function (agentId, transactionSwarmType, ...args) {
        let t = bm.createCRTransaction(transactionSwarmType, args, null, null, consensusAlgorithm.getCurrentPulse());
        t.signatures = [this.signAs(agentId, t.digest)];
        consensusAlgorithm.commit(t);
    };

    this.startTransactionAs = function (agentId, transactionSwarmType, ...args) {
        let swarm = $$.transaction.startWithContext(self, transactionSwarmType, ...args);
        swarm.setMetadata(CNST.COMMAND_ARGS, args);
        swarm.setMetadata(CNST.SIGNING_AGENT, agentId);
        return swarm;
        //console.log(swarm);
    };

    this.commit = function (transaction, callback) {
        let swarm = transaction.getSwarm();
        let handler = transaction.getHandler();
        const diff = handler.computeSwarmTransactionDiff(swarm);
        //console.log("Diff is", diff.output);
        const t = bm.createCRTransaction(swarm.getMetadata("swarmTypeName"), swarm.getMetadata(CNST.COMMAND_ARGS), diff.input, diff.output, consensusAlgorithm.getCurrentPulse());
        t.signatures = [self.signAs(swarm.getMetadata(CNST.SIGNING_AGENT), t.digest)];
        consensusAlgorithm.commit(t, callback);
    };

    this.onceAllCommitted = pskdb.onceAllCommitted;

    this.dump = function () {
        pskdb.getHandler().dump();
    };
}

function Transaction(blockchain, pdsHandler, transactionSwarm, worldStateCache, spr) {

    let self = this;

    this.getSwarm = function () {
        return transactionSwarm;
    };

    this.getHandler = function () {
        return pdsHandler;
    };

    this.add = function (asset) {
        const swarmTypeName = asset.getMetadata('swarmTypeName');
        const swarmId = asset.getMetadata('swarmId');

        const aliasIndex = new AliasIndex(swarmTypeName, pdsHandler, worldStateCache);
        if (asset.alias && aliasIndex.getUid(asset.alias) !== swarmId) {
            aliasIndex.create(asset.alias, swarmId);
        }


        const serializedSwarm = beesHealer.asJSON(asset, null, null);
        pdsHandler.writeKey(swarmTypeName + '/' + swarmId, J(serializedSwarm));
    };

    this.lookup = createLookup(blockchain, pdsHandler, spr, worldStateCache);

    this.loadAssets = createLoadAssets(blockchain, pdsHandler, worldStateCache);

    this.createAsset = function (swarmTypeName, ctor, ...args) {
        let asset = $$.assets.startWithContext(blockchain, swarmTypeName, ctor, ...args);
        this.add(asset);
        return asset;
    };

    this.reviveAsset = function (assetValue) {
        let asset = $$.assets.continue(assetValue);
        asset.__reinit(self);
        return asset;
    };


    this.commit = function () {
        blockchain.commit(self);
    };
}

module.exports = Blockchain;
},{"../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js","../moduleExports":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleExports.js","./securityParadigms/securityParadigmRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\securityParadigms\\securityParadigmRegistry.js","swarmutils":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\index.js":[function(require,module,exports){
const Blockchain = require('./Blockchain');

module.exports = {
    startDB: function (worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, loadDefaultConstitution) {
        if(loadDefaultConstitution){
            require('../defaultConstitution/assets/index');
            require('../defaultConstitution/swarms/index');
            require('../defaultConstitution/transactions/index');
        }
        let pds = require('./pskdb').newPSKDB(worldStateCache, historyStorage);
        consensusAlgorithm.pskdb = pds;
        let blockchain = new Blockchain(pds, consensusAlgorithm, worldStateCache, signatureProvider);
        pds.blockchain = blockchain;
        return blockchain;
    },
    startDefaultDB: function (worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, loadDefaultConstitution, forceReboot) {
        if ($$.blockchain && !forceReboot) {
            $$.exception('$$.blockchain is already defined. Throwing an exception!');
        }
        if(!worldStateCache || !historyStorage || !consensusAlgorithm || !signatureProvider){
            console.error("Initialisation failed with arguments:", worldStateCache, historyStorage, consensusAlgorithm, signatureProvider);
            $$.exception('$$.blockchain initialisation failed! Throwing an exception!');
        }
        $$.blockchain = this.startDB(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, loadDefaultConstitution);
        return $$.blockchain;
    }
};

},{"../defaultConstitution/assets/index":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\assets\\index.js","../defaultConstitution/swarms/index":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\swarms\\index.js","../defaultConstitution/transactions/index":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\defaultConstitution\\transactions\\index.js","./Blockchain":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\Blockchain.js","./pskdb":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\pskdb.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\pskdb.js":[function(require,module,exports){
let CNST = require("../moduleConstants");
let cutil = require("../OBFT/transactionsUtil");
// let bm = require("../moduleExports");

//var ssutil  = require("pskcrypto");


function KeyValueDBWithVersions(worldStateCache) { //main storage
    let cset = {};  // contains all keys
    let keyVersions = {};  //will store versions
    let self = this;

    this.dump = function () {
        //console.log("Main Storage", {keyVersions,cset})
        worldStateCache.dump();
    };

    this.readKey = function (keyName, mandatoryToExist) {
        if (keyVersions.hasOwnProperty(keyName)) {
            return cset[keyName];
        }
        if (mandatoryToExist) {
            keyVersions[keyName] = 0;
        }
        return undefined;
    };

    this.writeKey = function (keyName, value, newVersion) {

        if (keyVersions.hasOwnProperty(keyName)) {
            if (!newVersion) {
                keyVersions[keyName]++;
            } else {
                keyVersions[keyName] = newVersion;
            }
        } else {
            keyVersions[keyName] = 0;
        }
        cset[keyName] = value;
    };

    this.version = function (keyName) {
        if (keyVersions.hasOwnProperty(keyName)) {
            return keyVersions[keyName];
        }
        return undefined;
    };

    this.getInternalValues = function (currentPulse) {
        return {
            cset,
            versions: keyVersions,
            currentPulse
        }
    }
}

function DBTransactionHandler(parentStorage) {
    let readSetVersions = {}; //version of a key when read first time
    let writeSet = {};  //contains only keys modified in handlers

    this.dump = function () {
        console.log("DBTransactionHandler:", {readSetVersions, writeSet});
        parentStorage.dump();
    };

    this.readKey = function (keyName, mandatoryToExist) {
        function internalReadKey() {
            if (readSetVersions.hasOwnProperty(keyName)) {
                return writeSet[keyName];
            }
            let version = parentStorage.version(keyName);
            if (version != undefined) {
                readSetVersions[keyName] = version;
            }
            return parentStorage.readKey(keyName);
        }

        let result = internalReadKey();
        //writeSet[keyName] = result;

        /*
        if(mandatoryToExist){
            console.debug("Looking for ", keyName, " Version:", parentStorage.version(keyName), "Result:", result);
        }
        if(!result && mandatoryToExist){
            console.error("Found nothing for", keyName, "Key Version:", parentStorage.version(keyName));
            this.dump();
            $$.exception("Mandatory key not found:" + keyName);
        }*/
        return result;
    };

    this.writeKey = function (keyName, value) {
        this.readKey(keyName);         //save read version
        writeSet[keyName] = value;
    };

    this.computeSwarmTransactionDiff = function () {
        return {
            input: readSetVersions,
            output: writeSet
        };
    };
}


function PSKDB(worldStateCache, historyStorage) {
    this.blockchain = undefined;
    let mainStorage = new KeyValueDBWithVersions(worldStateCache);
    let self = this;

    let currentPulse = 0;
    let hashOfLatestCommittedBlock = "Genesis Block";

    this.getHandler = function () { // the single way of working with pskdb
        let tempStorage = new DBTransactionHandler(mainStorage);
        return tempStorage;
    };

    this.getCurrentPulse = function () {
        return currentPulse;
    };

    this.setCurrentPulse = function (cp) {
        currentPulse = cp;
    };

    this.getPreviousHash = function () {
        return hashOfLatestCommittedBlock;
    };

    this.initialise = function (reportResultCallback) {
        let gotLatestBlock_done = false;
        let gotState_done = false;
        let lbn = 0;
        let state = 0;
        let cp = 0;

        function loadNextBlock() {
            if (cp > lbn) {
                if (lbn != 0) {
                    currentPulse = cp;
                }
                reportResultCallback(null, lbn);
            } else {
                historyStorage.loadSpecificBlock(cp, function (err, block) {
                    if (block) {
                        self.commitBlock(block, true, (err) => {
                            if(err) {
                                reportResultCallback(err);
                                return;
                            }
                            cp = block.pulse;

                            cp++;
                            loadNextBlock();
                        });
                    } else {
                        cp++;
                        loadNextBlock();
                    }
                })
            }
        }

        function loadMissingBlocksFromHistory() {
            if (gotState_done && gotLatestBlock_done) {
                if (state && state.pulse) {
                    cp = state.pulse;
                }
                console.log("Reloading from cache at pulse ", cp, "and rebuilding state until pulse", lbn);
                if (state.pulse) {
                    mainStorage.initialiseInternalValue(state);
                }
                loadNextBlock();
            }
        }

        function gotLatestBlock(err, val) {
            gotLatestBlock_done = true;
            if (!err) {
                lbn = val;
            }
            loadMissingBlocksFromHistory();
        }

        function gotState(err, val) {
            gotState_done = true;

            if (!err) {
                state = val;
            }
            if (state.latestBlockHash) {
                hashOfLatestCommittedBlock = state.latestBlockHash;
            }
            loadMissingBlocksFromHistory();
        }

        worldStateCache.getState(gotState);
        historyStorage.getLatestBlockNumber(gotLatestBlock);
    };


    this.commitBlock = function (block, doNotSaveHistory, callback) {
        incrementCommitsNumber();
        let blockSet = block.blockset;
        currentPulse = block.pulse;

        let verificationKeySpace = new VerificationKeySpaceHandler(mainStorage, worldStateCache, this.blockchain);

        verificationKeySpace.commit(blockSet);

        hashOfLatestCommittedBlock = block.hash;
        if (!doNotSaveHistory) {
            historyStorage.appendBlock(block, false, (err) => {
                if (err) {
                    return callback(err);
                }

                __updateState();
            });
        } else {
            __updateState()
        }

        function __updateState() {
            let internalValues = mainStorage.getInternalValues(currentPulse);
            internalValues.latestBlockHash = block.hash;
            worldStateCache.updateState(internalValues, (...args) => {
                callback(...args);
                decrementCommitsNumber();
            });
        }
    };

    this.computePTBlock = function (nextBlockSet) {
        let tempStorage = new VerificationKeySpaceHandler(mainStorage, worldStateCache, this.blockchain);
        return tempStorage.computePTBlock(nextBlockSet);
    };

    const notifyCommittedCallbacks = [];
    let commitsInProgress = 0;
    this.onceAllCommitted = function (callback) {
        notifyCommittedCallbacks.push(callback);
    };

    function incrementCommitsNumber() {
        commitsInProgress += 1;
    }

    function decrementCommitsNumber() {
        commitsInProgress -= 1;

        if(commitsInProgress === 0) {
            notifyCommitted();
        }
    }

    function notifyCommitted() {
        for (const callback of notifyCommittedCallbacks) {
            callback();
        }

        notifyCommittedCallbacks.splice(0, notifyCommittedCallbacks.length);
    }

    /* Verification Space Digest is now the hash of the latest commited block*/
    this.getHashLatestBlock = historyStorage.getHashLatestBlock;
}

let lec = require("./securityParadigms/localExecutionCache");

/* play the role of DBTransactionHandler (readKey, writeKey) while also doing transaction validation*/
function VerificationKeySpaceHandler(parentStorage, worldStateCache, blockchain) {
    let readSetVersions = {}; //version of a key when read first time
    let writeSetVersions = {}; //increment version with each writeKey
    let writeSet = {};  //contains only keys modified in handlers
    let self = this;

    let aliases = {};

    this.dump = function () {
        console.log("VerificationKeySpaceHandler:", {readSetVersions, writeSetVersions, writeSet});
        parentStorage.dump();
    };


    this.readKey = function (keyName) {
        if (writeSetVersions.hasOwnProperty(keyName)) {
            return writeSet[keyName];
        }
        readSetVersions[keyName] = parentStorage.version(keyName);
        return parentStorage.readKey(keyName);
    };

    this.saveAlias = function (assetType, alias, swarmId) {
        aliases[swarmId] = {assetType, alias};
    };

    this.writeKey = function (keyName, value) {
        this.readKey(keyName);         //save read version
        if (!writeSetVersions.hasOwnProperty(keyName)) {
            writeSetVersions[keyName] = readSetVersions[keyName];
        }
        writeSetVersions[keyName]++;
        writeSet[keyName] = value;
    };

    this.version = function (keyName) {
        if (writeSetVersions.hasOwnProperty(keyName)) {
            return writeSetVersions[keyName];
        }
        return parentStorage.version(keyName);
    };

    function applyTransaction(t, willBeCommited) {
        let ret = true;
        lec.ensureEventTransaction(t);
        for (let k in t.input) {
            let transactionVersion = t.input[k];
            if (transactionVersion == undefined) {
                transactionVersion = 0;
            }
            let currentVersion = self.version(k);
            if (currentVersion == undefined || currentVersion == null) {
                currentVersion = 0;
            }
            if (transactionVersion != currentVersion) {
                //console.log(k, transactionVersion , currentVersion);
                //ret = "Failed to apply in transactionVersion != currentVersion (" + transactionVersion + "!="+ currentVersion + ")";
                return false;
            }
        }

        //TODO: potential double spending bug if a transaction was replaced
        if (!lec.verifyTransaction(t, self, willBeCommited, blockchain)) {
            return false;
        }

        for (let k in t.output) {
            self.writeKey(k, t.output[k]);
        }

        /* who has this responsability?
        if(willBeCommited){
            lec.removeFromCacheAtCommit(t);
        }*/
        return ret;
    }

    this.computePTBlock = function (nextBlockSet) {   //make a transactions block from nextBlockSet by removing invalid transactions from the key versions point of view
        let validBlock = [];
        let orderedByTime = cutil.orderCRTransactions(nextBlockSet);
        let i = 0;

        while (i < orderedByTime.length) {
            let t = orderedByTime[i];
            if (applyTransaction(t)) {
                validBlock.push(t.digest);
            }
            i++;
        }


        return validBlock;
    };

    this.commit = function (blockSet, reportDropping) {
        let i = 0;
        let orderedByTime = cutil.orderCRTransactions(blockSet);

        while (i < orderedByTime.length) {
            let t = orderedByTime[i];
            if (applyTransaction(t, true) && reportDropping) {
                $$.log("Dropping transaction", t);
            }

            i++;
        }

        for (let v in writeSetVersions) {
            parentStorage.writeKey(v, writeSet[v], writeSetVersions[v]);
        }

        worldStateCache.updateAliases(aliases);
    }
}


exports.newPSKDB = function (worldStateCache, historyStorage) {
    return new PSKDB(worldStateCache, historyStorage);
};
},{"../OBFT/transactionsUtil":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\transactionsUtil.js","../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js","./securityParadigms/localExecutionCache":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\securityParadigms\\localExecutionCache.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\securityParadigms\\localExecutionCache.js":[function(require,module,exports){
let CNST=require("../../moduleConstants");
let cache = {};

let alreadyVerified = {

};

function sandBoxedExecution(cet){
    let transactionType = cet.swarmType;
    $$.transactions.start("")
}

module.exports = {
    ensureEventTransaction:function(cetransaction){
        return cetransaction;
    },
    verifyTransaction:function(t, handler, forceDeepVerification, blockchain){

        //todo: to be removed later; modification done in the same time with the mod in pskdb
        return true;

        let old_assets = {};
        let new_assets = {};
        let fastCheck = true;

        if(!forceDeepVerification){
            let t = cache[t.digest];
            if(typeof t != undefined) return true;
        }

        for(let k in t.output){
            new_assets[k] = {};
            old_assets[k] = {};

            let  old_value = handler.readKey(k);
            let  new_value = t.output[k];

            let assetValue = JSON.parse(new_value);

            let asset = $$.assets.continue(assetValue);
            asset.__reinit(blockchain);

            new_assets[k][asset.getSwarmId()] = asset;
            handler.saveAlias(asset.getSwarmType(), asset.alias, asset.getSwarmId());

            if(old_value !== undefined){
                /* undefined for new asset (did not exist before current transaction)*/
                let assetValue = JSON.parse(old_value);
                let asset = $$.assets.continue(assetValue);
                asset.__reinit(blockchain);
                if(asset.securityParadigm.mainParadigm == CNST.CONSTITUTIONAL){
                    fastCheck = false;
                }
                old_assets[k][asset.getSwarmId()] = asset;;
            }
            //else ... force constitutional checks?
        }

        return true; //TODO: implement proper checks

        if(fastCheck){
            //check the signatures or other rules specified in security paradigms
        } else {
            //execute transaction again and see if the results are identical
        }
        cache[t.digest] = t;
        return true;
    },
    removeFromCacheAtCommit:function(t){
        delete alreadyVerified[t.digest];
        delete cache[t.digest];
    }
};

},{"../../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\securityParadigms\\securityParadigmRegistry.js":[function(require,module,exports){

var CNST = require("../../moduleConstants");

function ConstitutionalSPFactory(){
     this.constitutional = function(spm, optionalTransactionName){
         spm.mainParadigm = CNST.CONSTITUTIONAL;
         if(optionalTransactionName){
             spm.data[CNST.CONSTITUTIONAL] = optionalTransactionName;
             $$.notImplemented("optionalTransactionName is not properly implemented yet")
         }
         //spm.addSecurityParadigm(CNST.CONSTITUTIONAL ,optionalTransactionName);
     }

    /* we do not instantiate SPs... but anyway it behaves as some sort of factory in an virtual way of instantiation*/
    this.checkInsideTransactionValidation = function(transaction, asset){

    }
}

function PredicativeSPFactory(){
    let predicates = {};
    this.addPredicate = function(spm, predicateName, predicateDefinition){
        predicates[predicateName] = predicateDefinition;
        spm.mainParadigm = CNST.PREDICATIVE;
        spm.data[CNST.PREDICATIVE] = predicateName;
    }
    /* not allowed for now... maybe in future*/
    this.registerPredicate = function(predicateName, predicateFunction){

    }

    /* */
    this.checkInsideTransactionValidation = function(transaction, asset){

    }
}

function RestrictedSPFactory(){
    this.allow = function(spm, agentId){
        spm.mainParadigm = CNST.RESTRICTED;
        if(!spm.data[CNST.RESTRICTED]) {
            spm.data[CNST.RESTRICTED] = [agentId];
        } else {
            spm.data[CNST.RESTRICTED].push(agentId);
        }
    }

    this.checkInsideTransactionValidation = function(transaction, asset){

    }

}


function mkApi(sp, APIName, factory){
    return function(...args){
        return factory[APIName](sp, ...args);
    }
}

function SecurityParadigmMetadata(assetInstance,metaData, apiNames, allFactories){
    if(metaData != undefined){
        for(let v in metaData){
            this[v] =  metaData[v];
        }
    } else {
        this.mainParadigm = CNST.RESTRICTED;
        this.data = {};
    }

    //could be refined to add better restrictions
    for(let v in apiNames){
        this[apiNames[v]] = mkApi(this, apiNames[v], allFactories[v]);
    }
    assetInstance.setMetadata("SecurityParadigm", this);
}


function Registry(blockchain){
    let allFactories = {};
    let apiNames = {};
    let self = this;
    this.register = function (SPName, apiName, factory) {
        allFactories[SPName]         = factory;
        apiNames[SPName]    = apiName;
    }

    this.getSecurityParadigm = function(assetInstance){
        let  metaData = assetInstance.getMetadata(CNST.SECURITY_PARADIGM);
        return new SecurityParadigmMetadata(assetInstance, metaData, apiNames, allFactories);
    }

    self.register(CNST.CONSTITUTIONAL ,"constitutional", new ConstitutionalSPFactory());
    self.register(CNST.RESTRICTED,"allow", new RestrictedSPFactory());
    self.register(CNST.PREDICATIVE ,"addPredicate", new PredicativeSPFactory());

    this.validateTransaction = function(currentLayer, transaction){

    }
}

module.exports = {
    getRegistry: function () {
        /* normally should be called only once, made it more open for tests only...*/
        return new Registry();
    }
}
},{"../../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\signsensus\\SignSensusImplementation.js":[function(require,module,exports){
let pskcrypto = require("pskcrypto");
let fs = require("fs");

let consUtil = require("../OBFT/transactionsUtil");

let detailedDebug = false;


let pulseSwarm = $$.flow.describe("pulseSwarm", {
    start: function (delegatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity, votingBox) {

        this.lset = {}; // digest -> transaction - localy generated set of transactions (`createTransactionFromSwarm` stores each transaction; `beat` resets `lset`)
        this.dset = {}; // digest -> transaction - remotely delivered set of transactions that will be next participate in consensus
        this.pset = {}; // digest -> transaction - consensus pending set

        this.currentPulse = 0;
        this.topPulseConsensus = 0;
        this.lastPulseAchievedConsensus = 0;

        this.pulsesHistory = {};

        this.vsd = pdsAdapter.getHashLatestBlock();


        this.commitCounter = 0;                 // total  number of transactions that got commited

        this.nodeName               = delegatedAgentName;
        this.communicationOutlet    = communicationOutlet;
        this.pdsAdapter             = pdsAdapter;
        this.pulsePeriodicity       = pulsePeriodicity;
        this.votingBox              = votingBox;

        this.beat();
    },

    beat: function () {
        let ptBlock = null;
        let nextConsensusPulse = this.topPulseConsensus + 1;
        let majoritarianVSD = "none";

        while (nextConsensusPulse <= this.currentPulse) {
            ptBlock = consUtil.detectMajoritarianPTBlock(nextConsensusPulse, this.pulsesHistory, this.votingBox);
            majoritarianVSD = consUtil.detectMajoritarianVSD(nextConsensusPulse, this.pulsesHistory, this.votingBox);

            if (ptBlock != "none" && this.vsd == majoritarianVSD) {
                if (!this.hasAllTransactions(ptBlock)) {
                    this.print("Unknown transactions detected...")
                    break;
                }
                //console.log(this.nodeName, ptBlock.length,this.vsd, majoritarianVSD, nextConsensusPulse);
                if (ptBlock.length /*&& this.hasAllTransactions(ptBlock)*/) {
                    this.pset = consUtil.setsConcat(this.pset, this.dset);
                    this.dset = {};
                    let resultSet = consUtil.makeSetFromBlock(this.pset, ptBlock);

                    this.commitCounter += ptBlock.length;
                    //this.print("\t\tBlock [" + this.dumpPtBlock(ptBlock) + "] at pulse " + nextConsensusPulse + " and VSD " +  this.vsd.slice(0,8));

                    this.pdsAdapter.commit(resultSet);
                    let topDigest = ptBlock[ptBlock.length - 1];
                    this.topPulseConsensus = this.pset[topDigest].transactionPulse;
                    consUtil.setsRemovePtBlockAndPastTransactions(this.pset, ptBlock, this.topPulseConsensus); //cleanings
                    let oldVsd = this.vsd;
                    this.vsd = this.pdsAdapter.getVSD();

                    this.lastPulseAchievedConsensus = nextConsensusPulse;   //safer than `this.currentPulse`!?
                    //this.topPulseConsensus = nextConsensusPulse;

                    this.print("\t\t consensus at pulse " + nextConsensusPulse + " and VSD " + oldVsd.slice(0, 8));
                } else {
                    this.pset = consUtil.setsConcat(this.pset, this.dset);
                    this.dset = {};
                    this.lastPulseAchievedConsensus = nextConsensusPulse;   //safer than `this.currentPulse`!?
                    this.topPulseConsensus = nextConsensusPulse;
                    //this.print("\t\tEmpty " + " at: " + nextConsensusPulse );
                    //console.log("\t\tmajoritarian ", majoritarianVSD.slice(0,8) , nextConsensusPulse);
                }
                break; //exit WHILE

            } //end if (ptBlock != "none" && this.vsd == majoritarianVSD)

            nextConsensusPulse++;
        } //end while


        //daca nu a reusit,ar trebui sa vada daca nu exista un alt last majoritar
        ptBlock = this.pdsAdapter.computePTBlock(this.pset);

        let newPulse = consUtil.createPulse(
            this.nodeName,                          //==> Pulse.signer
            this.currentPulse,
            ptBlock,
            this.lset,
            this.vsd,
            this.topPulseConsensus,
            this.lastPulseAchievedConsensus);

        //console.log("\t\tPulse", this.nodeName, this.vsd.slice(0,8) );
        //this.print("Pulse" );
        this.recordPulse(newPulse);

        let self = this;
        self.communicationOutlet.broadcastPulse(newPulse);
        
        this.lset = {};
        this.currentPulse++;

        setTimeout(this.beat, this.pulsePeriodicity);   //self invocation of phase `beat`
    },
    hasAllTransactions: function (ptBlock) {
        for (let i = 0; i < ptBlock.length; i++) {
            let item = ptBlock[i];
            if (!this.pset.hasOwnProperty(item)) {
                //TODO: ask for the missing transaction
                return false;
            }
        }
        return true;
    },
    receiveTransaction: function (t) {
        this.lset[t.digest] = t;
        return t;
    },
    /**
     *
     * @param {Pulse} pulse e.g. new Pulse(this.nodeName, this.currentPulse, ......)
     */
    recordPulse: function (pulse) {
        let from = pulse.signer;

        if (!pulse.ptBlock) {
            pulse.ptBlock = [];
        }
        //pulse.blockDigest = pskcrypto.hashValues(pulse.ptBlock);
        //pulse.blockDigest = pulse.ptBlock.blockDigest;

        if (!this.pulsesHistory[pulse.currentPulse]) {
            this.pulsesHistory[pulse.currentPulse] = {};
        }
        this.pulsesHistory[pulse.currentPulse][from] = pulse;

        if(pulse.currentPulse >= this.topPulseConsensus) {
            if (pulse.currentPulse <= this.lastPulseAchievedConsensus) {
                for (let d in pulse.lset) {
                    this.pset[d] = pulse.lset[d];// could still be important for consensus
                }
            } else {
                for (let d in pulse.lset) {
                    this.dset[d] = pulse.lset[d];
                }
            }
        }
        //TODO: ask for pulses that others received but we failed to receive
    },

    dumpPtBlock: function (ptBlock) {
        return ptBlock.map(function (item) {
            return item.slice(0, 8);
        }).join(" ");
    },
    dump: function () {
        // this.print("Final");
    },
    print: function (str) {
        if (!detailedDebug) {
            if (str === "Pulse") return;
        }

        if (!str) {
            str = "State "
        }

        function countSet(set) {
            let l = 0;
            for (let v in set) l++;
            return l;
        }

        console.log(this.nodeName, " | ", str, " | ",
            "currentPulse:", this.currentPulse, "top:", this.topPulseConsensus, "LPAC:", this.lastPulseAchievedConsensus, "VSD:", this.vsd.slice(0, 8),
            " | ", countSet(this.pset), countSet(this.dset), countSet(this.lset),
            " | ", this.commitCounter / GLOBAL_MAX_TRANSACTION_TIME, " tranzactii pe secunda. Total tranzactii comise:", this.commitCounter);

    },
    printState: function () {
        console.log(this.nodeName, ",", this.currentPulse, ",", this.vsd);
    },
    printPset: function () {
        function sortedDigests(set) {
            let res = [];
            for (let d in set) {
                res.push(d);
            }
            return pskcrypto.hashValues(res.sort());
        }
        function appendToCSV(filename, arr) {
            const reducer = (accumulator, currentValue) => accumulator + " , " + currentValue;
            let str = arr.reduce(reducer, "") + "\n";
            fs.appendFileSync(filename, str);
        }

        let arr = [
            this.nodeName,
            this.currentPulse,
            this.topPulseConsensus,
            this.lastPulseAchievedConsensus,
            sortedDigests(this.pset),
            sortedDigests(this.dset),
            sortedDigests(this.lset),
            this.vsd
        ];
        appendToCSV("data.csv", arr);
        // console.log(this.nodeName,",",this.currentPulse,",",Object.keys(this.pset).length);
    }
});


/**
 * @param {String} delegatedAgentName e.g. 'Node 0', or 'agent_007'
 * @param {Object} communicationOutlet e.g. object to be used in phase `beat` of the returned "pulseSwarm" flow
 *  - it should have a property: `broadcastPulse`: function(from, pulse) {...}
 *      - {String} `from` e.g. `delegatedAgentName`
 *      - {Pulse} `pulse` (see 'transactionsUtil.js')
 * @param {InMemoryPDS} pdsAdapter e.g. require("pskdb/lib/InMemoryPDS").newPDS(null);
 * @param {Number} pulsePeriodicity e.g. 300
 * 
 * @returns {SwarmDescription} A new instance of "pulseSwarm" flow, with phase `start` already running
 */
exports.createConsensusManager = function (delegatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity, votingBox) {
    let instance = pulseSwarm();
    instance.start(delegatedAgentName, communicationOutlet, pdsAdapter, pulsePeriodicity, votingBox);
    return instance;
}

},{"../OBFT/transactionsUtil":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\transactionsUtil.js","fs":false,"pskcrypto":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\consensusAlgortims\\consensusAlgoritmsRegistry.js":[function(require,module,exports){
var mod = require("../../moduleExports");

function DirectCommitAlgorithm() {
    let pskdb = null;
    this.setPSKDB = function (_pskdb) {
        pskdb = _pskdb;
    };
    this.commit = function (transaction, callback) {
        const set = {};
        let cp = this.pskdb.getCurrentPulse();
        set[transaction.digest] = transaction;
        this.pskdb.commitBlock(mod.createBlock(set, cp, this.pskdb.getPreviousHash()), false, callback);

        cp++;
        this.pskdb.setCurrentPulse(cp);
    };

    this.getCurrentPulse = function () {
        return this.pskdb.getCurrentPulse();
    }
}


function SignSensusAlgoritm(nodeName, networkImplementation, pulsePeriodicity, votingBox) {
    let pskdb = null;
    let algorithm = null;
    this.setPSKDB = function (_pskdb) {
        pskdb = _pskdb;
        algorithm = require("../../signsensus/SignSensusImplementation").createConsensusManager(nodeName, networkImplementation, pskdb, pulsePeriodicity, votingBox);
        this.recordPulse = algorithm.recordPulse;
        console.log("Setting pskdb for algorithm")
    };

    this.commit = function (transaction) {
        algorithm.sendLocalTransactionToConsensus(transaction);
    };

    this.getCurrentPulse = function () {
        return algorithm.currentPulse;
    }
}


function OBFTAlgoritm(nodeName, networkImplementation, pulsePeriodicity, latency, votingBox) {
    let pskdb = null;
    let algorithm = null;
    this.setPSKDB = function (_pskdb) {
        pskdb = _pskdb;
        algorithm = require("../../OBFT/OBFTImplementation").createConsensusManager(nodeName, networkImplementation, pskdb, pulsePeriodicity, latency, votingBox);
        this.recordPulse = algorithm.recordPulse;
        console.log("Setting pskdb for algorithm")
    };

    this.commit = function (transaction) {
        algorithm.sendLocalTransactionToConsensus(transaction);
    };

    this.getCurrentPulse = function () {
        return algorithm.currentPulse;
    }
}

module.exports = {
    createAlgorithm: function (name, ...args) {
        switch (name) {
            case "direct":
                return new DirectCommitAlgorithm(...args);
            case "SignSensus":
                return new SignSensusAlgoritm(...args);
            case "OBFT":
                return new OBFTAlgoritm(...args);
            default:
                $$.exception("Unknown consensus algortihm  " + name);
        }
    }
};
},{"../../OBFT/OBFTImplementation":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\OBFTImplementation.js","../../moduleExports":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleExports.js","../../signsensus/SignSensusImplementation":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\signsensus\\SignSensusImplementation.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\BarHistoryStorage.js":[function(require,module,exports){
const LatestHashTracker = require("./LatestHashTracker");

function BarHistoryStorage(archive) {
    const blocksPath = "blocks";
    let lht = new LatestHashTracker();

    this.getHashLatestBlock = lht.getHashLatestBlock;
    let latestPulse = -1;

    this.appendBlock = function (block, announceFlag, callback) {
        archive.writeFile(blocksPath + "/" + block.pulse, JSON.stringify(block, null, 1), (err) => {
            if (err) {
                return callback(err);
            }

            if (block.pulse > latestPulse) {
                latestPulse = block.pulse;

                archive.writeFile(blocksPath + "/index", latestPulse.toString(), (err) => {
                    if (err) {
                        return callback(err);
                    }

                    lht.update(block.pulse, block);
                    callback();
                });
            } else {
                callback();
            }
        });
    };

    this.getLatestBlockNumber = function (callback) {
        let maxBlockNumber = 0;
        archive.readFile(blocksPath + "/index", (err, res) => {
            if (err) {
                return callback(err);
            }

            maxBlockNumber = parseInt(res.toString());

            callback(undefined, maxBlockNumber);
        });
    };

    this.loadSpecificBlock = function (blockNumber, callback) {
        archive.readFile(blocksPath + "/" + blockNumber.toString(), (err, res) => {
            if (err) {
                return callback(err);
            }

            try {
                res = JSON.parse(res.toString());
                lht.update(res.pulse, res);
            } catch (e) {
                callback(e);
                return;
            }

            callback(null, res);
        });
    };

    ////////////////////////
    let observer;
    //send to callback all blocks newer then fromVSD
    this.observeNewBlocks = function (fromVSD, callback) {
        observer = callback;
    }
}

module.exports = BarHistoryStorage;
},{"./LatestHashTracker":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\LatestHashTracker.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\FsHistoryStorage.js":[function(require,module,exports){
const LatestHashTracker = require("./LatestHashTracker");

function FsHistoryStorage(folder) {
    const blocksPath = folder + "/blocks";
    let lht = new LatestHashTracker();
    this.getHashLatestBlock = lht.getHashLatestBlock;

    let fs = require("fs");
    let latestPulse = -1;

    this.appendBlock = function (block, announceFlag, callback) {
        ensureBlocksPathExist((err) => {
            if (err) {
                return callback(err);
            }

            fs.writeFile(blocksPath + "/" + block.pulse, JSON.stringify(block, null, 1), (err) => {
                if (err) {
                    return callback(err);
                }

                if(block.pulse > latestPulse) {
                    latestPulse = block.pulse;

                    fs.writeFile(blocksPath + "/index", latestPulse.toString(), (err) => {
                        if (err) {
                            return callback(err);
                        }

                        lht.update(block.pulse, block);
                        callback();

                    });
                } else {
                    callback();
                }
            });
        });
    };

    this.getLatestBlockNumber = function (callback) {
        ensureBlocksPathExist((err) => {
            if (err) {
                return callback(err);
            }

            fs.readFile(blocksPath + "/index", function (err, res) {
                let maxBlockNumber = 0;
                if (err) {
                    callback(err);
                } else {
                    maxBlockNumber = parseInt(res);
                    callback(null, maxBlockNumber);
                }
            });
        });
    };

    this.loadSpecificBlock = function (blockNumber, callback) {
        ensureBlocksPathExist((err) => {
            if (err) {
                return callback(err);
            }

            fs.readFile(blocksPath + "/" + blockNumber, 'utf8', function (err, res) {
                if (err) {
                    callback(err, null);
                } else {
                    try {
                        res = JSON.parse(res);
                        lht.update(res.pulse, res);
                    } catch (e) {
                        console.log('could not parse', e, res);
                        callback(e);
                        return;
                    }

                    callback(null, res);
                }
            });
        });
    };

    ////////////////////////
    let observer;
    //send to callback all blocks newer then fromVSD
    this.observeNewBlocks = function (fromVSD, callback) {
        observer = callback;
    };

    //------------------------------------------- internal methods ----------------------------------------------------
    function ensureBlocksPathExist(callback) {
        fs.access(blocksPath, (err) => {
            if (err) {
                fs.mkdir(blocksPath, {recursive: true}, callback);
            }else{
                callback();
            }
        });
    }
}

module.exports = FsHistoryStorage;

},{"./LatestHashTracker":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\LatestHashTracker.js","fs":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\LatestHashTracker.js":[function(require,module,exports){
function LatestHashTracker() {
    let hlb = "none";
    let maxBlockNumber = 0;

    this.update = function (blockNumber, block) {
        if (blockNumber > maxBlockNumber) {
            hlb = block.blockDigest;
        }
    };

    this.getHashLatestBlock = function () {
        return hlb;
    }
}

module.exports = LatestHashTracker;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\MemoryHistoryStorage.js":[function(require,module,exports){
const LatestHashTracker = require("./LatestHashTracker");

function MemoryHistoryStorage() {
    let blocks = [];
    let lht = new LatestHashTracker();
    this.getHashLatestBlock = lht.getHashLatestBlock;

    this.appendBlock = function (block, announceFlag, callback) {
        blocks.push(block);
        lht.update(blocks.length, block);
        callback(null, block);

    };

    this.getLatestBlockNumber = function (callback) {
        callback(null, blocks.length);
    };

    this.loadSpecificBlock = function (blockNumber, callback) {
        let block = blocks[blockNumber];
        lht.update(blockNumber, block);
        callback(null, blocks[blockNumber]);
    }
}

module.exports = MemoryHistoryStorage;
},{"./LatestHashTracker":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\LatestHashTracker.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\historyStoragesRegistry.js":[function(require,module,exports){
const FsHistoryStorage = require("./FsHistoryStorage");
const MemoryHistoryStorage = require("./MemoryHistoryStorage");
const BarHistoryStorage = require("./BarHistoryStorage");

module.exports = {
    createStorage: function (storageType, ...args) {
        switch (storageType) {
            case "fs":
                return new FsHistoryStorage(...args);
            case "bar":
                return new BarHistoryStorage(...args);
            case "memory":
                return new MemoryHistoryStorage(...args);
            default:
                $$.exception("Unknown blockchain storage " + storageType);
        }
    }
};
},{"./BarHistoryStorage":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\BarHistoryStorage.js","./FsHistoryStorage":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\FsHistoryStorage.js","./MemoryHistoryStorage":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\MemoryHistoryStorage.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\networkCommunication\\networkCommunicationStrategiesRegistry.js":[function(require,module,exports){
const mc = require("../../moduleConstants");
let pulseUtil = require("../../OBFT/PulseUtil");


function IPCNetworkSimulator(){
    this.broadcastPulse = function(pulse){
        process.send(pulse);
    }

    this.newPulse = function(){
        let p = pulseUtil.createPulse()
        process.send(pulse);
    }

    this.listen = function(callback){
        process.on('message', function(msg){
            callback(null, msg);
        })
    }
}

/*
var com = {
    broadcastPulse: function(from, pulse){
        nodes.forEach( function(n){
            if(n.nodeName != from) {
                setTimeout(function(){
                    n.recordPulse(from, pulse);
                }, cutil.getRandomInt(cfg.NETWORK_DELAY));
            } else {
                if(pulse.currentPulse > 2 * maxPulse){
                    afterFinish[from] = true;
                }
            }
        });


        if(Object.keys(afterFinish).length >= cfg.MAX_NODES){
            console.log(Object.keys(afterFinish).length , cfg.MAX_NODES);
            setTimeout(terminate, 1);
        }
    }
} */



function VirtualMQAdapter(){

}

module.exports = {
    createNetworkAdapter: function (strategyType, ...args) {
        switch (strategyType) {
            case "ipc":
                return new IPCNetworkSimulator(...args);
            case "virtualmq":
                return new VirtualMQAdapter(...args);
            default:
                $$.error("Unknown communication strategy  " + strategyType);
        }
    }
}
},{"../../OBFT/PulseUtil":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\PulseUtil.js","../../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\signatureProvidersRegistry\\signatureProvidersRegistry.js":[function(require,module,exports){
function PermissiveSignatureProvider(){
    /*
    return a signature of message ms for agent agentId
     */
    this.signAs = function(agentId, msg){
        return "Signature from agent "+agentId + " should be here!";
    }

    this.verify = function(msg, signatures){
        return true;
    };
}


module.exports = {
    createSignatureProvider: function (signProvType,...args) {
        switch (signProvType) {
            case "permissive":
                return new PermissiveSignatureProvider(...args);
            case "blockchain":
            default:
                $$.exception("Signature Provider" + signProvType + " not implemented");
        }
    }
}

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\votingStrategies\\votingStrategiesRegistry.js":[function(require,module,exports){

function SimpleMajoritarianStrategy(shareHoldersCounter){
    this.refreshShares = function(){

    }
    this.vote = function (previousValue, agent) {
        if (!previousValue) {
            previousValue = 0;
        }
        return previousValue + 1;
    }

    this.isMajoritarian = function (value) {
        //console.log(value , Math.floor(shareHoldersCounter/2) + 1);
        return value >= Math.floor(shareHoldersCounter / 2) + 1;
    }
}


function BlockchainShareHoldersMajority(){
    let shares = {}
    this.refreshShares = function(){

    }

    this.vote = function (previousValue, agent) {
        if (!previousValue) {
            previousValue = 0;
        }
        return previousValue + shares[agent];
    }

    this.isMajoritarian = function (value) {
        return value > 0.50;
    }
}

module.exports = {
    createVotingStrategy: function (strategyType, ...args) {
        switch (strategyType) {
            case "democratic":
                return new SimpleMajoritarianStrategy(...args);
            case "shareholders":
                return new BlockchainShareHoldersMajority(...args);
            default:
                $$.error("Unknown voting strategy  " + strategyType);
        }
    }
}
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\worldStateCaches\\worldStateCacheRegistry.js":[function(require,module,exports){
(function (setImmediate){
const mc = require("../../moduleConstants");

function StorageContainer(){
    this.pskdb = {};
    this.keys = {};
    this.pulse = 0;
    let self = this;
    let latestState = {

    };

    this.readKey = function(key){
        return self.keys[key];
    };

    this.writeKey = function(key, value){
        self.keys[key] = value;
    };

    function updateAlias(assetType, alias,swarmId){
        let keyName = assetType + mc.ALIASES;
        let value = self.readKey(keyName);
        if(value === undefined){
            value = {};
            value[alias] = swarmId;
        } else {
            value = JSON.parse(value);
            value[alias] = swarmId;
        }
        self.writeKey(keyName,JSON.stringify(value));
    }

    this.updateAliases = function(aliases){
        for(let swarmId in aliases){
            updateAlias(aliases[swarmId].assetType, aliases[swarmId].alias, swarmId);
        }
    }
}

function BarCache(archive) {
    let storage = new StorageContainer();
    this.readKey = storage.readKey;
    this.writeKey = storage.writeKey;
    this.updateAliases = storage.updateAliases;

    //just in case the folder got to use as storage does not exist

    const worldStateCachePath = "/worldStateCache";

    this.getState = function (callback) {
        archive.readFile(worldStateCachePath,  function (err, res) {
            let objRes = {};
            if (err) {
                callback(err, objRes);
                console.log("Initialisating empty blockchain state");
            } else {
                objRes = JSON.parse(res);
                storage.pskdb = objRes.pskdb;
                storage.keys  = objRes.keys;
                storage.pulse  = objRes.pulse;
                callback(null, storage.pskdb);
            }
        });
    };

    this.updateState = function (internalValues, callback) {
        storage.pskdb = internalValues;
        archive.writeFile(worldStateCachePath, JSON.stringify(storage, null, 1), callback);
    };

    this.dump = function(){
        console.log("EDFSCache:", storage);
    }

}

function MemoryCache() {
    let storage = new StorageContainer();
    this.readKey = storage.readKey;
    this.writeKey = storage.writeKey;
    this.updateAliases = storage.updateAliases;

    this.getState = function (callback) { //err, valuesFromCache
        callback(null, storage.pskdb);
    };

    this.updateState = function (internalValues, callback) {
        //console.info("Commiting state in memory cache "/*, internalValues*/)
        storage.pskdb = internalValues;
        storage.pulse = internalValues.pulse;
        setImmediate(() => {
            callback(null, storage.pskdb);
        });
    };

    this.dump = function(){
        console.log("MemoryCache:", storage);
    }
}

function LocalWSCache(folder) {
    let storage = new StorageContainer();
    this.readKey = storage.readKey;
    this.writeKey = storage.writeKey;
    this.updateAliases = storage.updateAliases;

    //just in case the folder got to use as storage does not exist
    require("fs").mkdirSync(folder, {recursive: true});

    const worldStateCachePath = folder + "/worldStateCache";
    let fs = require("fs");

    this.getState = function (callback) {
        fs.readFile(worldStateCachePath, 'utf8', function (err, res) {
            let objRes = {};
            if (err) {
                callback(err, objRes);
                console.log("Initialisating empty blockchain state");
            } else {
                objRes = JSON.parse(res);
                storage.pskdb = objRes.pskdb;
                storage.keys  = objRes.keys;
                storage.pulse  = objRes.pulse;
                callback(null, storage.pskdb);
            }
        });
    };

    this.updateState = function (internalValues, callback) {
        storage.pskdb = internalValues;
        fs.writeFile(worldStateCachePath, JSON.stringify(storage, null, 1), callback);
    };

    this.dump = function(){
        console.log("LocalWSCache:", storage);
    }

}


module.exports = {
    createCache: function (cacheType, ...args) {
        switch (cacheType) {
            case "fs":
                return new LocalWSCache(...args);
            case "bar":
                return new BarCache(...args);
            case "memory":
                return new MemoryCache(...args);
            default:
                $$.exception("Unknown blockchain cache " + cacheType);
        }
    }
};
}).call(this,require("timers").setImmediate)

},{"../../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js","fs":false,"timers":false}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\array-set.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

exports.ArraySet = ArraySet;

},{"./util":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\util.js"}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\base64-vlq.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = require('./base64');

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
exports.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
exports.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

},{"./base64":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\base64.js"}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\base64.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
exports.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
exports.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

},{}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\binary-search.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};

},{}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\mapping-list.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

exports.MappingList = MappingList;

},{"./util":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\util.js"}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\quick-sort.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
exports.quickSort = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

},{}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-map-consumer.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util = require('./util');
var binarySearch = require('./binary-search');
var ArraySet = require('./array-set').ArraySet;
var base64VLQ = require('./base64-vlq');
var quickSort = require('./quick-sort').quickSort;

function SourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap)
    : new BasicSourceMapConsumer(sourceMap);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap);
}

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      if (source != null && sourceRoot != null) {
        source = util.join(sourceRoot, source);
      }
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: Optional. the column number in the original source.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    if (this.sourceRoot != null) {
      needle.source = util.relative(this.sourceRoot, needle.source);
    }
    if (!this._sources.has(needle.source)) {
      return [];
    }
    needle.source = this._sources.indexOf(needle.source);

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

exports.SourceMapConsumer = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The only parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._sources.toArray().map(function (s) {
      return this.sourceRoot != null ? util.join(this.sourceRoot, s) : s;
    }, this);
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64VLQ.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          if (this.sourceRoot != null) {
            source = util.join(this.sourceRoot, source);
          }
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    if (this.sourceRoot != null) {
      aSource = util.relative(this.sourceRoot, aSource);
    }

    if (this._sources.has(aSource)) {
      return this.sourcesContent[this._sources.indexOf(aSource)];
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = aSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + aSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + aSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    if (this.sourceRoot != null) {
      source = util.relative(this.sourceRoot, source);
    }
    if (!this._sources.has(source)) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }
    source = this._sources.indexOf(source);

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

exports.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The only parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = JSON.parse(aSourceMap.replace(/^\)\]\}'/, ''));
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'))
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.
 *   - column: The column number in the generated source.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.
 *   - column: The column number in the original source, or null.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.
 *   - column: The column number in the original source.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.
 *   - column: The column number in the generated source, or null.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer.sources.indexOf(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        if (section.consumer.sourceRoot !== null) {
          source = util.join(section.consumer.sourceRoot, source);
        }
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = section.consumer._names.at(mapping.name);
        this._names.add(name);
        name = this._names.indexOf(name);

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util.compareByOriginalPositions);
  };

exports.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

},{"./array-set":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\array-set.js","./base64-vlq":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\base64-vlq.js","./binary-search":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\binary-search.js","./quick-sort":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\quick-sort.js","./util":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\util.js"}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-map-generator.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ = require('./base64-vlq');
var util = require('./util');
var ArraySet = require('./array-set').ArraySet;
var MappingList = require('./mapping-list').MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util.getArg(aArgs, 'file', null);
  this._sourceRoot = util.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet();
  this._names = new ArraySet();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util.getArg(aArgs, 'generated');
    var original = util.getArg(aArgs, 'original', null);
    var source = util.getArg(aArgs, 'source', null);
    var name = util.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet();
    var newNames = new ArraySet();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util.join(aSourceMapPath, mapping.source)
          }
          if (sourceRoot != null) {
            mapping.source = util.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = ''

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util.relative(aSourceRoot, source);
      }
      var key = util.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

exports.SourceMapGenerator = SourceMapGenerator;

},{"./array-set":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\array-set.js","./base64-vlq":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\base64-vlq.js","./mapping-list":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\mapping-list.js","./util":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\util.js"}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-node.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = require('./source-map-generator').SourceMapGenerator;
var util = require('./util');

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex];
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex];
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

exports.SourceNode = SourceNode;

},{"./source-map-generator":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-map-generator.js","./util":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\util.js"}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\util.js":[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.]*)(?::(\d+))?(\S*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || !!aPath.match(urlRegexp);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = mappingA.source - mappingB.source;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return mappingA.name - mappingB.name;
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

},{}],"blockchain":[function(require,module,exports){
___DISABLE_OBSOLETE_ZIP_ARCHIVER_WAIT_FOR_BARS = true;
//require("../../../psknode/bundles/pskruntime.js");
var callflowModule = require("callflow");
let assetUtils = require("./blockchainSwarmTypes/asset_swarm_template");
let transactionUtils = require("./blockchainSwarmTypes/transaction_swarm_template");
$$.assets           = callflowModule.createSwarmEngine("asset", assetUtils);
$$.asset            = $$.assets;
$$.transactions     = callflowModule.createSwarmEngine("transaction", transactionUtils);
$$.transaction      = $$.transactions;

module.exports = require('./moduleExports');


},{"./blockchainSwarmTypes/asset_swarm_template":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\blockchainSwarmTypes\\asset_swarm_template.js","./blockchainSwarmTypes/transaction_swarm_template":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\blockchainSwarmTypes\\transaction_swarm_template.js","./moduleExports":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleExports.js","callflow":false}],"buffer-from":[function(require,module,exports){
(function (Buffer){
var toString = Object.prototype.toString

var isModern = (
  typeof Buffer.alloc === 'function' &&
  typeof Buffer.allocUnsafe === 'function' &&
  typeof Buffer.from === 'function'
)

function isArrayBuffer (input) {
  return toString.call(input).slice(8, -1) === 'ArrayBuffer'
}

function fromArrayBuffer (obj, byteOffset, length) {
  byteOffset >>>= 0

  var maxLength = obj.byteLength - byteOffset

  if (maxLength < 0) {
    throw new RangeError("'offset' is out of bounds")
  }

  if (length === undefined) {
    length = maxLength
  } else {
    length >>>= 0

    if (length > maxLength) {
      throw new RangeError("'length' is out of bounds")
    }
  }

  return isModern
    ? Buffer.from(obj.slice(byteOffset, byteOffset + length))
    : new Buffer(new Uint8Array(obj.slice(byteOffset, byteOffset + length)))
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  return isModern
    ? Buffer.from(string, encoding)
    : new Buffer(string, encoding)
}

function bufferFrom (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (isArrayBuffer(value)) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return isModern
    ? Buffer.from(value)
    : new Buffer(value)
}

module.exports = bufferFrom

}).call(this,require("buffer").Buffer)

},{"buffer":false}],"source-map-support":[function(require,module,exports){
var SourceMapConsumer = require('source-map').SourceMapConsumer;
var path = require('path');

var fs;
try {
  fs = require('fs');
  if (!fs.existsSync || !fs.readFileSync) {
    // fs doesn't have all methods we need
    fs = null;
  }
} catch (err) {
  /* nop */
}

var bufferFrom = require('buffer-from');

// Only install once if called multiple times
var errorFormatterInstalled = false;
var uncaughtShimInstalled = false;

// If true, the caches are reset before a stack trace formatting operation
var emptyCacheBetweenOperations = false;

// Supports {browser, node, auto}
var environment = "auto";

// Maps a file path to a string containing the file contents
var fileContentsCache = {};

// Maps a file path to a source map for that file
var sourceMapCache = {};

// Regex for detecting source maps
var reSourceMap = /^data:application\/json[^,]+base64,/;

// Priority list of retrieve handlers
var retrieveFileHandlers = [];
var retrieveMapHandlers = [];

function isInBrowser() {
  if (environment === "browser")
    return true;
  if (environment === "node")
    return false;
  return ((typeof window !== 'undefined') && (typeof XMLHttpRequest === 'function') && !(window.require && window.module && window.process && window.process.type === "renderer"));
}

function hasGlobalProcessEventEmitter() {
  return ((typeof process === 'object') && (process !== null) && (typeof process.on === 'function'));
}

function handlerExec(list) {
  return function(arg) {
    for (var i = 0; i < list.length; i++) {
      var ret = list[i](arg);
      if (ret) {
        return ret;
      }
    }
    return null;
  };
}

var retrieveFile = handlerExec(retrieveFileHandlers);

retrieveFileHandlers.push(function(path) {
  // Trim the path to make sure there is no extra whitespace.
  path = path.trim();
  if (/^file:/.test(path)) {
    // existsSync/readFileSync can't handle file protocol, but once stripped, it works
    path = path.replace(/file:\/\/\/(\w:)?/, function(protocol, drive) {
      return drive ?
        '' : // file:///C:/dir/file -> C:/dir/file
        '/'; // file:///root-dir/file -> /root-dir/file
    });
  }
  if (path in fileContentsCache) {
    return fileContentsCache[path];
  }

  var contents = '';
  try {
    if (!fs) {
      // Use SJAX if we are in the browser
      var xhr = new XMLHttpRequest();
      xhr.open('GET', path, /** async */ false);
      xhr.send(null);
      if (xhr.readyState === 4 && xhr.status === 200) {
        contents = xhr.responseText;
      }
    } else if (fs.existsSync(path)) {
      // Otherwise, use the filesystem
      contents = fs.readFileSync(path, 'utf8');
    }
  } catch (er) {
    /* ignore any errors */
  }

  return fileContentsCache[path] = contents;
});

// Support URLs relative to a directory, but be careful about a protocol prefix
// in case we are in the browser (i.e. directories may start with "http://" or "file:///")
function supportRelativeURL(file, url) {
  if (!file) return url;
  var dir = path.dirname(file);
  var match = /^\w+:\/\/[^\/]*/.exec(dir);
  var protocol = match ? match[0] : '';
  var startPath = dir.slice(protocol.length);
  if (protocol && /^\/\w\:/.test(startPath)) {
    // handle file:///C:/ paths
    protocol += '/';
    return protocol + path.resolve(dir.slice(protocol.length), url).replace(/\\/g, '/');
  }
  return protocol + path.resolve(dir.slice(protocol.length), url);
}

function retrieveSourceMapURL(source) {
  var fileData;

  if (isInBrowser()) {
     try {
       var xhr = new XMLHttpRequest();
       xhr.open('GET', source, false);
       xhr.send(null);
       fileData = xhr.readyState === 4 ? xhr.responseText : null;

       // Support providing a sourceMappingURL via the SourceMap header
       var sourceMapHeader = xhr.getResponseHeader("SourceMap") ||
                             xhr.getResponseHeader("X-SourceMap");
       if (sourceMapHeader) {
         return sourceMapHeader;
       }
     } catch (e) {
     }
  }

  // Get the URL of the source map
  fileData = retrieveFile(source);
  var re = /(?:\/\/[@#][\s]*sourceMappingURL=([^\s'"]+)[\s]*$)|(?:\/\*[@#][\s]*sourceMappingURL=([^\s*'"]+)[\s]*(?:\*\/)[\s]*$)/mg;
  // Keep executing the search to find the *last* sourceMappingURL to avoid
  // picking up sourceMappingURLs from comments, strings, etc.
  var lastMatch, match;
  while (match = re.exec(fileData)) lastMatch = match;
  if (!lastMatch) return null;
  return lastMatch[1];
};

// Can be overridden by the retrieveSourceMap option to install. Takes a
// generated source filename; returns a {map, optional url} object, or null if
// there is no source map.  The map field may be either a string or the parsed
// JSON object (ie, it must be a valid argument to the SourceMapConsumer
// constructor).
var retrieveSourceMap = handlerExec(retrieveMapHandlers);
retrieveMapHandlers.push(function(source) {
  var sourceMappingURL = retrieveSourceMapURL(source);
  if (!sourceMappingURL) return null;

  // Read the contents of the source map
  var sourceMapData;
  if (reSourceMap.test(sourceMappingURL)) {
    // Support source map URL as a data url
    var rawData = sourceMappingURL.slice(sourceMappingURL.indexOf(',') + 1);
    sourceMapData = bufferFrom(rawData, "base64").toString();
    sourceMappingURL = source;
  } else {
    // Support source map URLs relative to the source URL
    sourceMappingURL = supportRelativeURL(source, sourceMappingURL);
    sourceMapData = retrieveFile(sourceMappingURL);
  }

  if (!sourceMapData) {
    return null;
  }

  return {
    url: sourceMappingURL,
    map: sourceMapData
  };
});

function mapSourcePosition(position) {
  var sourceMap = sourceMapCache[position.source];
  if (!sourceMap) {
    // Call the (overrideable) retrieveSourceMap function to get the source map.
    var urlAndMap = retrieveSourceMap(position.source);
    if (urlAndMap) {
      sourceMap = sourceMapCache[position.source] = {
        url: urlAndMap.url,
        map: new SourceMapConsumer(urlAndMap.map)
      };

      // Load all sources stored inline with the source map into the file cache
      // to pretend like they are already loaded. They may not exist on disk.
      if (sourceMap.map.sourcesContent) {
        sourceMap.map.sources.forEach(function(source, i) {
          var contents = sourceMap.map.sourcesContent[i];
          if (contents) {
            var url = supportRelativeURL(sourceMap.url, source);
            fileContentsCache[url] = contents;
          }
        });
      }
    } else {
      sourceMap = sourceMapCache[position.source] = {
        url: null,
        map: null
      };
    }
  }

  // Resolve the source URL relative to the URL of the source map
  if (sourceMap && sourceMap.map && typeof sourceMap.map.originalPositionFor === 'function') {
    var originalPosition = sourceMap.map.originalPositionFor(position);

    // Only return the original position if a matching line was found. If no
    // matching line is found then we return position instead, which will cause
    // the stack trace to print the path and line for the compiled file. It is
    // better to give a precise location in the compiled file than a vague
    // location in the original file.
    if (originalPosition.source !== null) {
      originalPosition.source = supportRelativeURL(
        sourceMap.url, originalPosition.source);
      return originalPosition;
    }
  }

  return position;
}

// Parses code generated by FormatEvalOrigin(), a function inside V8:
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js
function mapEvalOrigin(origin) {
  // Most eval() calls are in this format
  var match = /^eval at ([^(]+) \((.+):(\d+):(\d+)\)$/.exec(origin);
  if (match) {
    var position = mapSourcePosition({
      source: match[2],
      line: +match[3],
      column: match[4] - 1
    });
    return 'eval at ' + match[1] + ' (' + position.source + ':' +
      position.line + ':' + (position.column + 1) + ')';
  }

  // Parse nested eval() calls using recursion
  match = /^eval at ([^(]+) \((.+)\)$/.exec(origin);
  if (match) {
    return 'eval at ' + match[1] + ' (' + mapEvalOrigin(match[2]) + ')';
  }

  // Make sure we still return useful information if we didn't find anything
  return origin;
}

// This is copied almost verbatim from the V8 source code at
// https://code.google.com/p/v8/source/browse/trunk/src/messages.js. The
// implementation of wrapCallSite() used to just forward to the actual source
// code of CallSite.prototype.toString but unfortunately a new release of V8
// did something to the prototype chain and broke the shim. The only fix I
// could find was copy/paste.
function CallSiteToString() {
  var fileName;
  var fileLocation = "";
  if (this.isNative()) {
    fileLocation = "native";
  } else {
    fileName = this.getScriptNameOrSourceURL();
    if (!fileName && this.isEval()) {
      fileLocation = this.getEvalOrigin();
      fileLocation += ", ";  // Expecting source position to follow.
    }

    if (fileName) {
      fileLocation += fileName;
    } else {
      // Source code does not originate from a file and is not native, but we
      // can still get the source position inside the source string, e.g. in
      // an eval string.
      fileLocation += "<anonymous>";
    }
    var lineNumber = this.getLineNumber();
    if (lineNumber != null) {
      fileLocation += ":" + lineNumber;
      var columnNumber = this.getColumnNumber();
      if (columnNumber) {
        fileLocation += ":" + columnNumber;
      }
    }
  }

  var line = "";
  var functionName = this.getFunctionName();
  var addSuffix = true;
  var isConstructor = this.isConstructor();
  var isMethodCall = !(this.isToplevel() || isConstructor);
  if (isMethodCall) {
    var typeName = this.getTypeName();
    // Fixes shim to be backward compatable with Node v0 to v4
    if (typeName === "[object Object]") {
      typeName = "null";
    }
    var methodName = this.getMethodName();
    if (functionName) {
      if (typeName && functionName.indexOf(typeName) != 0) {
        line += typeName + ".";
      }
      line += functionName;
      if (methodName && functionName.indexOf("." + methodName) != functionName.length - methodName.length - 1) {
        line += " [as " + methodName + "]";
      }
    } else {
      line += typeName + "." + (methodName || "<anonymous>");
    }
  } else if (isConstructor) {
    line += "new " + (functionName || "<anonymous>");
  } else if (functionName) {
    line += functionName;
  } else {
    line += fileLocation;
    addSuffix = false;
  }
  if (addSuffix) {
    line += " (" + fileLocation + ")";
  }
  return line;
}

function cloneCallSite(frame) {
  var object = {};
  Object.getOwnPropertyNames(Object.getPrototypeOf(frame)).forEach(function(name) {
    object[name] = /^(?:is|get)/.test(name) ? function() { return frame[name].call(frame); } : frame[name];
  });
  object.toString = CallSiteToString;
  return object;
}

function wrapCallSite(frame) {
  if(frame.isNative()) {
    return frame;
  }

  // Most call sites will return the source file from getFileName(), but code
  // passed to eval() ending in "//# sourceURL=..." will return the source file
  // from getScriptNameOrSourceURL() instead
  var source = frame.getFileName() || frame.getScriptNameOrSourceURL();
  if (source) {
    var line = frame.getLineNumber();
    var column = frame.getColumnNumber() - 1;

    // Fix position in Node where some (internal) code is prepended.
    // See https://github.com/evanw/node-source-map-support/issues/36
    var headerLength = 62;
    if (line === 1 && column > headerLength && !isInBrowser() && !frame.isEval()) {
      column -= headerLength;
    }

    var position = mapSourcePosition({
      source: source,
      line: line,
      column: column
    });
    frame = cloneCallSite(frame);
    var originalFunctionName = frame.getFunctionName;
    frame.getFunctionName = function() { return position.name || originalFunctionName(); };
    frame.getFileName = function() { return position.source; };
    frame.getLineNumber = function() { return position.line; };
    frame.getColumnNumber = function() { return position.column + 1; };
    frame.getScriptNameOrSourceURL = function() { return position.source; };
    return frame;
  }

  // Code called using eval() needs special handling
  var origin = frame.isEval() && frame.getEvalOrigin();
  if (origin) {
    origin = mapEvalOrigin(origin);
    frame = cloneCallSite(frame);
    frame.getEvalOrigin = function() { return origin; };
    return frame;
  }

  // If we get here then we were unable to change the source position
  return frame;
}

// This function is part of the V8 stack trace API, for more info see:
// https://v8.dev/docs/stack-trace-api
function prepareStackTrace(error, stack) {
  if (emptyCacheBetweenOperations) {
    fileContentsCache = {};
    sourceMapCache = {};
  }

  var name = error.name || 'Error';
  var message = error.message || '';
  var errorString = name + ": " + message;

  return errorString + stack.map(function(frame) {
    return '\n    at ' + wrapCallSite(frame);
  }).join('');
}

// Generate position and snippet of original source with pointer
function getErrorSource(error) {
  var match = /\n    at [^(]+ \((.*):(\d+):(\d+)\)/.exec(error.stack);
  if (match) {
    var source = match[1];
    var line = +match[2];
    var column = +match[3];

    // Support the inline sourceContents inside the source map
    var contents = fileContentsCache[source];

    // Support files on disk
    if (!contents && fs && fs.existsSync(source)) {
      try {
        contents = fs.readFileSync(source, 'utf8');
      } catch (er) {
        contents = '';
      }
    }

    // Format the line from the original source code like node does
    if (contents) {
      var code = contents.split(/(?:\r\n|\r|\n)/)[line - 1];
      if (code) {
        return source + ':' + line + '\n' + code + '\n' +
          new Array(column).join(' ') + '^';
      }
    }
  }
  return null;
}

function printErrorAndExit (error) {
  var source = getErrorSource(error);

  // Ensure error is printed synchronously and not truncated
  if (process.stderr._handle && process.stderr._handle.setBlocking) {
    process.stderr._handle.setBlocking(true);
  }

  if (source) {
    console.error();
    console.error(source);
  }

  console.error(error.stack);
  process.exit(1);
}

function shimEmitUncaughtException () {
  var origEmit = process.emit;

  process.emit = function (type) {
    if (type === 'uncaughtException') {
      var hasStack = (arguments[1] && arguments[1].stack);
      var hasListeners = (this.listeners(type).length > 0);

      if (hasStack && !hasListeners) {
        return printErrorAndExit(arguments[1]);
      }
    }

    return origEmit.apply(this, arguments);
  };
}

var originalRetrieveFileHandlers = retrieveFileHandlers.slice(0);
var originalRetrieveMapHandlers = retrieveMapHandlers.slice(0);

exports.wrapCallSite = wrapCallSite;
exports.getErrorSource = getErrorSource;
exports.mapSourcePosition = mapSourcePosition;
exports.retrieveSourceMap = retrieveSourceMap;

exports.install = function(options) {
  options = options || {};

  if (options.environment) {
    environment = options.environment;
    if (["node", "browser", "auto"].indexOf(environment) === -1) {
      throw new Error("environment " + environment + " was unknown. Available options are {auto, browser, node}")
    }
  }

  // Allow sources to be found by methods other than reading the files
  // directly from disk.
  if (options.retrieveFile) {
    if (options.overrideRetrieveFile) {
      retrieveFileHandlers.length = 0;
    }

    retrieveFileHandlers.unshift(options.retrieveFile);
  }

  // Allow source maps to be found by methods other than reading the files
  // directly from disk.
  if (options.retrieveSourceMap) {
    if (options.overrideRetrieveSourceMap) {
      retrieveMapHandlers.length = 0;
    }

    retrieveMapHandlers.unshift(options.retrieveSourceMap);
  }

  // Support runtime transpilers that include inline source maps
  if (options.hookRequire && !isInBrowser()) {
    var Module;
    try {
      Module = require('module');
    } catch (err) {
      // NOP: Loading in catch block to convert webpack error to warning.
    }
    var $compile = Module.prototype._compile;

    if (!$compile.__sourceMapSupport) {
      Module.prototype._compile = function(content, filename) {
        fileContentsCache[filename] = content;
        sourceMapCache[filename] = undefined;
        return $compile.call(this, content, filename);
      };

      Module.prototype._compile.__sourceMapSupport = true;
    }
  }

  // Configure options
  if (!emptyCacheBetweenOperations) {
    emptyCacheBetweenOperations = 'emptyCacheBetweenOperations' in options ?
      options.emptyCacheBetweenOperations : false;
  }

  // Install the error reformatter
  if (!errorFormatterInstalled) {
    errorFormatterInstalled = true;
    Error.prepareStackTrace = prepareStackTrace;
  }

  if (!uncaughtShimInstalled) {
    var installHandler = 'handleUncaughtExceptions' in options ?
      options.handleUncaughtExceptions : true;

    // Provide the option to not install the uncaught exception handler. This is
    // to support other uncaught exception handlers (in test frameworks, for
    // example). If this handler is not installed and there are no other uncaught
    // exception handlers, uncaught exceptions will be caught by node's built-in
    // exception handler and the process will still be terminated. However, the
    // generated JavaScript code will be shown above the stack trace instead of
    // the original source code.
    if (installHandler && hasGlobalProcessEventEmitter()) {
      uncaughtShimInstalled = true;
      shimEmitUncaughtException();
    }
  }
};

exports.resetRetrieveHandlers = function() {
  retrieveFileHandlers.length = 0;
  retrieveMapHandlers.length = 0;

  retrieveFileHandlers = originalRetrieveFileHandlers.slice(0);
  retrieveMapHandlers = originalRetrieveMapHandlers.slice(0);
  
  retrieveSourceMap = handlerExec(retrieveMapHandlers);
  retrieveFile = handlerExec(retrieveFileHandlers);
}

},{"buffer-from":"buffer-from","fs":false,"module":false,"path":false,"source-map":"source-map"}],"source-map":[function(require,module,exports){
/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
exports.SourceMapGenerator = require('./lib/source-map-generator').SourceMapGenerator;
exports.SourceMapConsumer = require('./lib/source-map-consumer').SourceMapConsumer;
exports.SourceNode = require('./lib/source-node').SourceNode;

},{"./lib/source-map-consumer":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-map-consumer.js","./lib/source-map-generator":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-map-generator.js","./lib/source-node":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-node.js"}]},{},["D:\\Catalin\\Munca\\privatesky\\builds\\tmp\\blockchain_intermediar.js"])
//# sourceMappingURL=blockchain.js.map