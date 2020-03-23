testsRuntimeRequire=(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({"D:\\Catalin\\Munca\\privatesky\\builds\\tmp\\testsRuntime.js":[function(require,module,exports){
const or = require('overwrite-require');
or.enableForEnvironment(or.constants.NODEJS_ENVIRONMENT_TYPE);
require("./testsRuntime_intermediar");
require("double-check");
},{"./testsRuntime_intermediar":"D:\\Catalin\\Munca\\privatesky\\builds\\tmp\\testsRuntime_intermediar.js","double-check":"double-check","overwrite-require":"overwrite-require"}],"D:\\Catalin\\Munca\\privatesky\\builds\\tmp\\testsRuntime_intermediar.js":[function(require,module,exports){
(function (global){
global.testsRuntimeLoadModules = function(){ 

	if(typeof $$.__runtimeModules["source-map-support"] === "undefined"){
		$$.__runtimeModules["source-map-support"] = require("source-map-support");
	}

	if(typeof $$.__runtimeModules["source-map"] === "undefined"){
		$$.__runtimeModules["source-map"] = require("source-map");
	}

	if(typeof $$.__runtimeModules["buffer-from"] === "undefined"){
		$$.__runtimeModules["buffer-from"] = require("buffer-from");
	}

	if(typeof $$.__runtimeModules["overwrite-require"] === "undefined"){
		$$.__runtimeModules["overwrite-require"] = require("overwrite-require");
	}

	if(typeof $$.__runtimeModules["pskcrypto"] === "undefined"){
		$$.__runtimeModules["pskcrypto"] = require("pskcrypto");
	}

	if(typeof $$.__runtimeModules["edfs"] === "undefined"){
		$$.__runtimeModules["edfs"] = require("edfs");
	}

	if(typeof $$.__runtimeModules["double-check"] === "undefined"){
		$$.__runtimeModules["double-check"] = require("double-check");
	}

	if(typeof $$.__runtimeModules["blockchain"] === "undefined"){
		$$.__runtimeModules["blockchain"] = require("blockchain");
	}

	if(typeof $$.__runtimeModules["swarmutils"] === "undefined"){
		$$.__runtimeModules["swarmutils"] = require("swarmutils");
	}

	if(typeof $$.__runtimeModules["soundpubsub"] === "undefined"){
		$$.__runtimeModules["soundpubsub"] = require("soundpubsub");
	}

	if(typeof $$.__runtimeModules["dossier"] === "undefined"){
		$$.__runtimeModules["dossier"] = require("dossier");
	}

	if(typeof $$.__runtimeModules["swarm-engine"] === "undefined"){
		$$.__runtimeModules["swarm-engine"] = require("swarm-engine");
	}
};
if (false) {
	testsRuntimeLoadModules();
}
global.testsRuntimeRequire = require;
if (typeof $$ !== "undefined") {
	$$.requireBundle("testsRuntime");
}
require('source-map-support').install({});
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"blockchain":"blockchain","buffer-from":"buffer-from","dossier":"dossier","double-check":"double-check","edfs":"edfs","overwrite-require":"overwrite-require","pskcrypto":"pskcrypto","soundpubsub":"soundpubsub","source-map":"source-map","source-map-support":"source-map-support","swarm-engine":"swarm-engine","swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\OBFTImplementation.js":[function(require,module,exports){
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

},{"./transactionsUtil":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\transactionsUtil.js","fs":false,"pskcrypto":"pskcrypto"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\PulseUtil.js":[function(require,module,exports){
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

},{"pskcrypto":"pskcrypto"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\blockchainSwarmTypes\\asset_swarm_template.js":[function(require,module,exports){
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
},{"./pskdb":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\index.js","./strategies/consensusAlgortims/consensusAlgoritmsRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\consensusAlgortims\\consensusAlgoritmsRegistry.js","./strategies/historyStorages/historyStoragesRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\historyStorages\\historyStoragesRegistry.js","./strategies/networkCommunication/networkCommunicationStrategiesRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\networkCommunication\\networkCommunicationStrategiesRegistry.js","./strategies/signatureProvidersRegistry/signatureProvidersRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\signatureProvidersRegistry\\signatureProvidersRegistry.js","./strategies/votingStrategies/votingStrategiesRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\votingStrategies\\votingStrategiesRegistry.js","./strategies/worldStateCaches/worldStateCacheRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\worldStateCaches\\worldStateCacheRegistry.js","pskcrypto":"pskcrypto"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\Blockchain.js":[function(require,module,exports){
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
},{"../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js","../moduleExports":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleExports.js","./securityParadigms/securityParadigmRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\securityParadigms\\securityParadigmRegistry.js","swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\pskdb\\index.js":[function(require,module,exports){
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

},{"../OBFT/transactionsUtil":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\OBFT\\transactionsUtil.js","fs":false,"pskcrypto":"pskcrypto"}],"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\strategies\\consensusAlgortims\\consensusAlgoritmsRegistry.js":[function(require,module,exports){
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

},{"../../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\blockchain\\moduleConstants.js","fs":false,"timers":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\runner.js":[function(require,module,exports){
(function (Buffer,__dirname){
const fs = require("fs");
const path = require("path");
const forker = require('child_process');

const configuration_file_name = "double-check.json";

let globToRegExp =  require("./utils/glob-to-regexp");

const TAG = "[TEST_RUNNER]";
const MAX_WORKERS = process.env['DOUBLE_CHECK_POOL_SIZE'] || 10;
const RUNNER_VERBOSE = process.env['DOUBLE_CHECK_RUNNER_VERBOSE'] || true;

const WORKER_PROCESS_STATES = {
    READY: 'ready',
    RUNNING: 'running',
    FINISHED: 'finished'
};

function TestRunner(){

    // Session object
    function initializeSession() {
        return {
            testCount: 0,
            currentTestIndex: 0,
            processedTestCount: 0,
            workers: {
                running: 0,
                terminated: 0
            }
        };
    }

    let defaultConfig = {
        fileExt: ".js",                         // test file supported by extension
        matchDirs: ["*"],
        testDirs: process.cwd(),                // path to the root tests location
        ignore: [".git"],
        reports: {
            basePath: process.cwd(),            // path where the reports will be saved
            prefix: "Report-",                  // prefix for report files, filename pattern: [prefix]-{timestamp}{ext}
            ext: ".txt"                         // report file extension
        }
    };

    // Template structure for test reports.
    let reportFileStructure = {
        count: 0,
        suites: new Set(),
        passed: new Set(),
        failed: new Set()
    };

    let config;

    function init(cfg){

        // no matter how and when runner is exiting first of all do a report print
        let process_exit = process.exit;
        process.exit = (...args)=>{
            process.exit = process_exit;
            doReports(()=>{
                process.exit(...args);
            });
        };

        process.on("SIGINT", process.exit);
        //--------------------------------------------------------------------------------------

        config = extend(defaultConfig, cfg);
        debug("Starting config", config);

        //the testTree holds the tree of directories and files descovered
        this.testTree = {};
        //sorted list of all test files discovered
        this.testList = [];

        this.session = initializeSession();

        // create reports directory if not exist
        if (!fs.existsSync(config.reports.basePath)){
            fs.mkdirSync(config.reports.basePath);
        }
    }

    function getDefaultNodeStructure() {
        return  {
            __meta: {
                conf: null,
                parent: null,
                isDirectory: false
            },
            data: {
                name: null,
                path: null,
            },
            result: {
                state: WORKER_PROCESS_STATES.READY, // ready | running | terminated | timeout
                pass: null,
                executionTime: 0,
                runs: 0,
                asserts: [],
                messages: []
            },
            items: null
        };
    }

    function discoverTestFiles(dir, parentConf) {
        dir = path.resolve(dir);
        const stat = fs.statSync(dir);
        if(!stat.isDirectory()){
            throw new Error(dir + " is not a directory!");
        }

        let currentConf = parentConf;

        let currentNode = getDefaultNodeStructure();
        currentNode.__meta.parent = path.dirname(dir);
        currentNode.__meta.isDirectory = true;

        let files = fs.readdirSync(dir);
        // first look for conf file
        if(files.indexOf(configuration_file_name) !== -1) {
            let fd = path.join(dir, configuration_file_name);
            let conf = readConf(fd);
            if(conf) {
                currentNode.__meta.conf = conf;
                currentConf = extend(currentConf, conf);
                //currentConf = conf;
            }
        }

        currentNode.data.name = path.basename(dir);
        currentNode.data.path = dir;
        currentNode.items = [];

        for(let i = 0, len = files.length; i < len; i++) {
            let item = files[i];

            let fd = path.join(dir, item);
            let stat = fs.statSync(fd);
            let isDir = stat.isDirectory();
            let isTestDir = validateAsTestDir(fd);

            if(isDir && !isTestDir) {
                continue; // ignore dirs that does not follow the naming rule for test dirs
            }

            if(!isDir && item.match(configuration_file_name)){
                continue; // already processed
            }

            // exclude files based on glob patterns
            if(currentConf) {
                // currentConf['ignore'] - array of regExp
                if(currentConf['ignore']) {
                    const isMatch = isAnyMatch(currentConf['ignore'], item);
                    if(isMatch) {continue;}
                }
            }

            let childNode = getDefaultNodeStructure();
            childNode.__meta.conf = {};
            childNode.__meta.isDirectory = isDir;
            childNode.__meta.parent = path.dirname(fd);

            if (isDir) {
                let tempChildNode = discoverTestFiles(fd, currentConf);
                childNode = Object.assign(childNode, tempChildNode);
                currentNode.items.push(childNode);
            }
            else if(path.extname(fd) ===  config.fileExt){
                childNode.__meta.conf.runs = currentConf['runs'] || 1;
                childNode.__meta.conf.silent = currentConf['silent'];

                childNode.data.name = item;
                childNode.data.path = fd;
                reportFileStructure.suites.add(childNode.__meta.parent);
                currentNode.items.push(childNode);
            }
        }

        return currentNode;
    }

    function readConf(confPath) {
        var config = {};
        try{
            config = require(confPath);
        } catch(error) {
            console.error(error);
        }

        return config;
    }

    function validateAsTestDir(dir) {
        if(!config || !config.matchDirs) {
            throw new Error(`matchDirs is not defined on config ${JSON.stringify(config)} does not exist!`);
        }

       let isTestDir = isAnyMatch(config.matchDirs, dir);

        return isTestDir;
    }

    function isAnyMatch(globExpArray, str) {
        const hasMatch = function(globExp) {
            const regex = globToRegExp(globExp);
            return regex.test(str);
        };

        return globExpArray.some(hasMatch);
    }

    let launchTests = () => {

        this.session.testCount = this.testList.length;

        console.log(`Start launching tests (${this.session.testCount})...`);

        reportFileStructure.startDate = new Date().getTime();
        reportFileStructure.count = this.session.testCount;
        if(this.session.testCount > 0) {
            setInterval(scheduleWork, 100);
        } else {
            doReports();
        }
    };

    let scheduleWork = () => {
        //launching tests for each workers available
        while(this.session.workers.running < MAX_WORKERS && this.session.currentTestIndex < this.session.testCount){
            let test = this.testList[this.session.currentTestIndex];
            launchTest(test);
        }
    };

    let launchTest = (test) => {
        this.session.workers.running++;

        test.result.state = WORKER_PROCESS_STATES.RUNNING;

        let env = process.env;

        const cwd = test.__meta.parent;
        console.log("Executing", test.data.path);
        let worker = forker.fork(test.data.path, [], {
                'cwd': cwd,
                'env': env,
                stdio: ["inherit", "pipe", 'pipe', 'ipc'],
                silent: false
            });

        worker.on("exit", onExitEventHandlerWrapper(test));
        worker.on("message", onMessageEventHandlerWrapper(test));
        worker.on("error", onErrorEventHandlerWrapper(test));
        worker.stderr.on("data", messageCaughtOnStdErr(test));

        debug(`Launching test ${test.data.name}, on worker pid[${worker.pid}] `);
        console.log(`Progress: ${this.session.currentTestIndex+1} of ${this.session.testCount}`);

        this.session.currentTestIndex++;

        worker.stdout.on('data', function (dataBuffer) {
            let content = dataBuffer.toString('utf8');
            if (test.__meta.conf.silent) {
                console.log(content);
            }
            test.result.messages.push(content);
        }.bind(this));


        var self = this;

        function onMessageEventHandlerWrapper(test) {
            return function (log) {
                if (log.type === 'assert') {
                    test.result.asserts.push(log);
                } else {
                    test.result.messages.push(log);
                }
            };
        }

        function onExitEventHandlerWrapper(test) {
            return function (code, signal) {
                //clearTimeout(worker.timerVar);
                debug(`Test ${test.data.name} exit with code ${code}, signal ${signal} `);

                test.result.state = WORKER_PROCESS_STATES.FINISHED;
                self.session.processedTestCount++;
                if (code === 0 && test.result.pass === null) {
                    test.result.pass = true;
                    reportFileStructure.passed.add(test);
                } else {
                    test.result.pass = false;
                    reportFileStructure.failed.add(test);
                    test.result.messages.push("Process finished with errors!",
                        `Exit code: ${code} Signal: ${signal}`);
                }

                self.session.workers.running--;
                self.session.workers.terminated++;

                //scheduleWork();
                checkWorkersStatus();
            };
        }

        // this handler can be triggered when:
        // 1. The process could not be spawned, or
        // 2. The process could not be killed, or
        // 3. Sending a message to the child process failed.
        // IMPORTANT: The 'exit' event may or may not fire after an error has occurred!
        function onErrorEventHandlerWrapper(test) {
            return function (error) {
                if(Buffer.isBuffer(error)){
                    error = error.toString();
                }
                debug(`Worker ${worker.pid} - error event.`, test.data.name);
                //debug(error);

                test.result.pass = false;
                test.result.messages.push(error);

                reportFileStructure.failed.add(test);
                self.session.workers.running--;
                self.session.workers.terminated++;
            };
        }

        function messageCaughtOnStdErr(test) {
            return function (error) {
                if(Buffer.isBuffer(error)){
                    error = error.toString();
                }
                //debug(`Worker ${worker.pid} - error event.`, test.data.name);
                //debug(error);

                test.result.pass = false;
                test.result.messages.push(error);

                reportFileStructure.failed.add(test);
            };
        }
    };

    let checkWorkersStatus = ()=>{
        let remaining = this.session.testCount - this.session.processedTestCount;
        if(this.session.workers.running === 0 && remaining === 0) {
            doReports();
        }else{
            console.log(`Testing still in progress... ${this.session.workers.running} workers busy and ${remaining} tests are waiting to finish.`);
        }
    };

    let reportsAllReadyPrinted = false;
    let doReports = (cb) => {
        if(reportsAllReadyPrinted){
            if(cb){
                cb();
            }
           return;
        }
        reportsAllReadyPrinted = true;
        //doing reports :D
        //on console and html report please!
        reportFileStructure.endDate = new Date().getTime();
        reportFileStructure.runned = this.session.processedTestCount;

        doConsoleReport();

        doHTMLReport((err, res)=>{
            if(cb){
                cb(err, res);
            }
            this.callback(err, this.session);
        });
    };

    let doConsoleReport = () =>{
        console.log("\n\nResults\n==========================");
        console.log(`Finish running ${this.session.processedTestCount} tests from a total of ${this.session.testCount}.`);
        console.log(`\x1b[31m ${reportFileStructure.failed.size} \x1b[0mfailed tests and \x1b[32m ${reportFileStructure.passed.size} \x1b[0mpassed tests.`);

        const sortedTestResults = [...reportFileStructure.failed, ...reportFileStructure.passed];
        const greenCheckbox = '\x1b[32m \u2714 \x1b[0m';
        const redCross = '\x1b[31m \u274C \x1b[0m';

        console.log("==========================\nSummary:");
        for (const test of sortedTestResults) {
            const passed = test.result.pass;

            console.log(` ${passed ? greenCheckbox : redCross} ${test.data.name}`);
            if(!passed){
                console.log(`\t at (${test.data.path}:1:1)`);
            }
        }
        console.log("==========================");
    };

    let doHTMLReport = (cb) => {
        var folderName = path.resolve(__dirname);
        fs.readFile(path.join(folderName,'/utils/report.html'), 'utf8', (err, res) => {
            if (err) {
                debug("An error occurred while reading the html report template file. HTML report can't be generated for now.");
                if(cb){
                    cb();
                }
                return;
            }
            let destination = path.join(process.cwd(), "testReport.html");
            let summary = JSON.parse(JSON.stringify(reportFileStructure));
            summary.failed = Array.from(reportFileStructure.failed);
            summary.passed = Array.from(reportFileStructure.passed);
            summary.suites = Array.from(reportFileStructure.suites);

            let content = res.replace("</html>", `<script>\nprint(${JSON.stringify(summary)});\n</script>\n</html>`);
            fs.writeFile(destination, content, 'utf8', (err) => {
                if (err) {
                    debug('An error occurred while writing the html report file, with the following error: ' + JSON.stringify(err));
                    throw err;
                }

                debug(`Finished writing HTML Report to file://${destination}`);
                if(cb){
                    cb();
                }
            });
        });
    };

    function debug(...args){
        if(!RUNNER_VERBOSE){
            return;
        }

        console.log(...args);
    }

    function extend(first, second) {
        for (const key in second) {
            if (!first.hasOwnProperty(key)) {
                first[key] = second[key];
            } else {
                let val = second[key];
                if(typeof first[key] === 'object') {
                    val = extend(first[key], second[key]);
                }
                first[key] = val;
            }
        }

        return first;
    }

    function testTreeToList(rootNode) {
        var testList = [];

        traverse(rootNode);

        function traverse(node) {
            if(!node.__meta.isDirectory || !node.items) {
                return;
            }

            for(let i = 0, len = node.items.length; i < len; i++) {
                const item = node.items[i];
                if(item.__meta.isDirectory) {
                    traverse(item);
                } else {
                    testList.push(item);
                }
            }
        }

        return testList;
    }

    /**
     * Main entry point. It will start the flow runner flow.
     * @param cfg {Object} - object containing settings such as conf file name, test dir.
     * @param callback {Function} - handler(error, result) invoked when an error occurred or the runner has completed all jobs.
     */
    this.start = function(cfg, callback){

        this.callback = function(err, result) {
            if(err) {
                debug("Sending error to the callback", err);
            }

            if(callback) {
                return callback(err, result);
            }
        };

        init.call(this, cfg);

        console.log("Start discovering tests ...");
        let testTree = [];
        if(Array.isArray(config.testDirs)){
            for(let i=0; i<config.testDirs.length; i++){
                testTree = testTree.concat(discoverTestFiles(config.testDirs[i], config));
            }
        }else{
            testTree = discoverTestFiles(config.testDirs, config);
        }

        this.testList = [];
        for(let i=0; i<testTree.length; i++){
            this.testList = this.testList.concat(testTreeToList(testTree[i]));
        }

        launchTests();
    }
}

exports.init = function(sf) {
    sf.testRunner = new TestRunner();
}

}).call(this,{"isBuffer":require("../../../node_modules/is-buffer/index.js")},"/modules/double-check/lib")

},{"../../../node_modules/is-buffer/index.js":"D:\\Catalin\\Munca\\privatesky\\node_modules\\is-buffer\\index.js","./utils/glob-to-regexp":"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\utils\\glob-to-regexp.js","child_process":false,"fs":false,"path":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\standardAsserts.js":[function(require,module,exports){
(function (global){
module.exports.init = function (sf, logger) {
    /**
     * Registering handler for failed asserts. The handler is doing logging and is throwing an error.
     * @param explanation {String} - failing reason message.
     */
    let __failWasAlreadyGenerated = false;
    let __assetsCounter = 0;
    let beginWasCalled = false;


    if(typeof global.timeoutUntilBegin === "undefined"){
        global.timeoutUntilBegin = setTimeout(function () {
            if (!beginWasCalled) {
                sf.assert.begin("asset.begin was not called, the exit time for the test is automatically set to 2 seconds. asset.callback can increase this time");
            }
        }, 1000);
    }else{
        console.trace("DoubleCheck was evaluated atleast 2 times! Maybe it was required from disk instead of bundles.");
    }



    /**
     * Registering assert for printing a message and asynchronously printing all logs from logger.dumpWhys.
     * @param message {String} - message to be recorded
     * @param cleanFunctions {Function} - cleaning function
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('forceFailedTest', function (message, err) {
        console.error("Test should fail because:", message, err);
        __failWasAlreadyGenerated = true;
    });

    /**
     * Registering assert for printing a message and asynchronously printing all logs from logger.dumpWhys.
     * @param message {String} - message to be recorded
     * @param cleanFunctions {Function} - cleaning function
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('begin', function (message, cleanFunctions, timeout) {
        //logger.recordAssert(message);
        beginWasCalled = true;
        console.log(message);
        sf.assert.end(cleanFunctions, timeout, true);
    });


    function recordFail(...args) { //record fail only once
        if (!__failWasAlreadyGenerated) {
            __failWasAlreadyGenerated = true;
            logger.recordAssert(...args);
        }
    }

    function delayEnd(message, milliseconds) {
        if (!beginWasCalled) {
            clearTimeout(timeoutUntilBegin);
            sf.assert.begin(message, null, milliseconds);
        } else {
            //console.log('Begin was called before the delay could be applied')
        }
    }

    /**
     * Registering assert for evaluating a value to null. If check fails, the assertFail is invoked.
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.exceptions.register('assertFail', function (explanation) {
        const message = "Assert or invariant has failed " + (explanation ? explanation : "");
        const err = new Error(message);
        err.isFailedAssert = true;
        recordFail('[Fail] ' + message, err, true);
        throw err;
    });

    /**
     * Registering assert for equality. If check fails, the assertFail is invoked.
     * @param v1 {String|Number|Object} - first value
     * @param v1 {String|Number|Object} - second value
     * @param explanation {String} - failing reason message in case the assert fails.
     */
    sf.assert.addCheck('equal', function (v1, v2, explanation) {
        if (v1 !== v2) {
            if (!explanation) {
                explanation = "Assertion failed: [" + v1 + " !== " + v2 + "]";
            }
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for inequality. If check fails, the assertFail is invoked.
     * @param v1 {String|Number|Object} - first value
     * @param v1 {String|Number|Object} - second value
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('notEqual', function (v1, v2, explanation) {
        if (v1 === v2) {
            if (!explanation) {
                explanation = " [" + v1 + " == " + v2 + "]";
            }
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating an expression to true. If check fails, the assertFail is invoked.
     * @param b {Boolean} - result of an expression
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('true', function (b, explanation) {
        if (!b) {
            if (!explanation) {
                explanation = " expression is false but is expected to be true";
            }
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating an expression to false. If check fails, the assertFail is invoked.
     * @param b {Boolean} - result of an expression
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('false', function (b, explanation) {
        if (b) {
            if (!explanation) {
                explanation = " expression is true but is expected to be false";
            }
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating a value to null. If check fails, the assertFail is invoked.
     * @param b {Boolean} - result of an expression
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('isNull', function (v1, explanation) {
        if (v1 !== null) {
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating a value to be not null. If check fails, the assertFail is invoked.
     * @param b {Boolean} - result of an expression
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck('notNull', function (v1, explanation) {
        if (v1 === null && typeof v1 === "object") {
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Checks if all properties of the second object are own properties of the first object.
     * @param firstObj {Object} - first object
     * @param secondObj{Object} - second object
     * @returns {boolean} - returns true, if the check has passed or false otherwise.
     */
    function objectHasFields(firstObj, secondObj) {
        for (let field in secondObj) {
            if (firstObj.hasOwnProperty(field)) {
                if (firstObj[field] !== secondObj[field]) {
                    return false;
                }
            } else {
                return false;
            }
        }
        return true;
    }

    function objectsAreEqual(firstObj, secondObj) {
        let areEqual = true;
        if (firstObj !== secondObj) {
            if (typeof firstObj !== typeof secondObj) {
                areEqual = false;
            } else if (Array.isArray(firstObj) && Array.isArray(secondObj)) {
                firstObj.sort();
                secondObj.sort();
                if (firstObj.length !== secondObj.length) {
                    areEqual = false;
                } else {
                    for (let i = 0; i < firstObj.length; ++i) {
                        if (!objectsAreEqual(firstObj[i], secondObj[i])) {
                            areEqual = false;
                            break;
                        }
                    }
                }
            } else if ((typeof firstObj === 'function' && typeof secondObj === 'function') ||
                (firstObj instanceof Date && secondObj instanceof Date) ||
                (firstObj instanceof RegExp && secondObj instanceof RegExp) ||
                (firstObj instanceof String && secondObj instanceof String) ||
                (firstObj instanceof Number && secondObj instanceof Number)) {
                areEqual = firstObj.toString() === secondObj.toString();
            } else if (typeof firstObj === 'object' && typeof secondObj === 'object') {
                areEqual = objectHasFields(firstObj, secondObj);
                // isNaN(undefined) returns true
            } else if (isNaN(firstObj) && isNaN(secondObj) && typeof firstObj === 'number' && typeof secondObj === 'number') {
                areEqual = true;
            } else {
                areEqual = false;
            }
        }

        return areEqual;
    }

    /**
     * Registering assert for evaluating if all properties of the second object are own properties of the first object.
     * If check fails, the assertFail is invoked.
     * @param firstObj {Object} - first object
     * @param secondObj{Object} - second object
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck("objectHasFields", function (firstObj, secondObj, explanation) {
        if (!objectHasFields(firstObj, secondObj)) {
            sf.exceptions.assertFail(explanation);
        }
    });

    /**
     * Registering assert for evaluating if all element from the second array are present in the first array.
     * Deep comparison between the elements of the array is used.
     * If check fails, the assertFail is invoked.
     * @param firstArray {Array}- first array
     * @param secondArray {Array} - second array
     * @param explanation {String} - failing reason message in case the assert fails
     */
    sf.assert.addCheck("arraysMatch", function (firstArray, secondArray, explanation) {
        if (firstArray.length !== secondArray.length) {
            sf.exceptions.assertFail(explanation);
        } else {
            const result = objectsAreEqual(firstArray, secondArray);
            // const arraysDontMatch = secondArray.every(element => firstArray.indexOf(element) !== -1);
            // let arraysDontMatch = secondArray.some(function (expectedElement) {
            //     let found = firstArray.some(function(resultElement){
            //         return objectHasFields(resultElement,expectedElement);
            //     });
            //     return found === false;
            // });

            if (!result) {
                sf.exceptions.assertFail(explanation);
            }
        }
    });

    // added mainly for test purposes, better test frameworks like mocha could be much better

    /**
     * Registering assert for checking if a function is failing.
     * If the function is throwing an exception, the test is passed or failed otherwise.
     * @param testName {String} - test name or description
     * @param func {Function} - function to be invoked
     */
    sf.assert.addCheck('fail', function (testName, func) {
        try {
            func();
            recordFail("[Fail] " + testName);
        } catch (err) {
            logger.recordAssert("[Pass] " + testName);
        }
    });

    /**
     * Registering assert for checking if a function is executed with no exceptions.
     * If the function is not throwing any exception, the test is passed or failed otherwise.
     * @param testName {String} - test name or description
     * @param func {Function} - function to be invoked
     */
    sf.assert.addCheck('pass', function (testName, func) {
        try {
            func();
            logger.recordAssert("[Pass] " + testName);
        } catch (err) {
            recordFail("[Fail] " + testName, err.stack);
        }
    });

    /**
     * Alias for the pass assert.
     */
    sf.assert.alias('test', 'pass');

    /**
     * Registering assert for checking if a callback function is executed before timeout is reached without any exceptions.
     * If the function is throwing any exception or the timeout is reached, the test is failed or passed otherwise.
     * @param testName {String} - test name or description
     * @param func {Function} - function to be invoked
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('callback', function (testName, func, timeout) {

        if (!func || typeof func != "function") {
            throw new Error("Wrong usage of assert.callback!");
        }

        if (!timeout) {
            timeout = 500;
        }

        __assetsCounter++;

        let passed = false;

        function callback() {
            __assetsCounter--;
            if (!passed) {
                passed = true;
                logger.recordAssert("[Pass] " + testName);
                successTest();
            } else {
                recordFail("[Fail (multiple calls)] " + testName);
            }

            if(__assetsCounter === 0){
                //small tweak to eliminate potential not necessary timeout until the test end
                sf.assert.end(undefined, 0, true);
            }
        }

        setTimeout(successTest, timeout);
        delayEnd(testName, timeout + 100);

        try {
            func(callback);
        } catch (err) {
            recordFail("[Fail] " + testName, err, true);
        }

        function successTest(force) {
            if (!passed) {
                logger.recordAssert("[Fail Timeout] " + testName);
            }
        }


    });

    /**
     * Registering assert for checking if an array of callback functions are executed in a waterfall manner,
     * before timeout is reached without any exceptions.
     * If any of the functions is throwing any exception or the timeout is reached, the test is failed or passed otherwise.
     * @param testName {String} - test name or description
     * @param func {Function} - function to be invoked
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('steps', function (testName, arr, timeout) {
        if (!timeout) {
            timeout = 500;
        }

        let currentStep = 0;
        let passed = false;

        function next() {
            if (currentStep === arr.length) {
                passed = true;
                logger.recordAssert("[Pass] " + testName);
                return;
            }

            const func = arr[currentStep];
            currentStep++;
            try {
                func(next);
            } catch (err) {
                recordFail("[Fail] " + testName + " [at step " + currentStep + "]", err);
            }
        }

        function successTest(force) {
            if (!passed) {
                recordFail("[Fail Timeout] " + testName + " [at step " + currentStep + "]");
            }
        }

        setTimeout(successTest, timeout);
        // delayEnd(testName, timeout + 100);
        next();
    });

    /**
     * Alias for the steps assert.
     */
    sf.assert.alias('waterfall', 'steps');


    let cleaningArray = [];
    /**
     * Registering a cleaning function
     * @param func {Function} - function to be invoked
     */
    sf.assert.addCheck('addCleaningFunction', function (func) {
        cleaningArray.push(func);
    });

    /**
     * Registering a cleaning function
     * @param func {Function} - function to be invoked
     */
    sf.assert.addCheck('disableCleanings', function (func) {
        cleaningArray = [];
    });

    sf.assert.addCheck('hashesAreEqual', function (hash1, hash2) {
        if (!Array.isArray(hash1) && !Array.isArray(hash2)) {
            return hash1 === hash2;
        }

        if (!Array.isArray(hash1) || !Array.isArray(hash2)) {
            return false;
        }

        hash1.sort();
        hash2.sort();
        for (let i in hash1) {
            if (hash1[i] !== hash2[i]) {
                return false;
            }
        }

        return true;
    });

    /**
     * Registering assert for asynchronously printing all execution summary from logger.dumpWhys.
     * @param message {String} - message to be recorded
     * @param timeout {Number} - number of milliseconds for the timeout check. Default to 500ms.
     */
    sf.assert.addCheck('end', function (cleaningFunction, timeout, silence) {
        if (!timeout) {
            timeout = 1000;
        }

        function handler() {
            if (logger.dumpWhys) {
                logger.dumpWhys().forEach(function (c) {
                    const executionSummary = c.getExecutionSummary();
                    console.log(JSON.stringify(executionSummary, null, 4));
                });
            }

            if (!silence) {
                console.log("Forcing exit after", timeout, "ms");
            }

            setTimeout(function () {
                if (__failWasAlreadyGenerated || __assetsCounter != 0) {
                    process.exit(1);
                } else {
                    process.exit(0);
                }
            }, 1000);

            cleaningArray.map(function (func) {
                func();
            });
            if (cleaningFunction) {
                cleaningFunction();
            }
        }

        setTimeout(handler, timeout);
    });


};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\standardChecks.js":[function(require,module,exports){
/*
    checks are like asserts but are intended to be used in production code to help debugging and signaling wrong behaviours

 */

exports.init = function(sf){
    sf.exceptions.register('checkFail', function(explanation, err){
        var stack;
        if(err){
            stack = err.stack;
        }
        console.log("Check failed ", explanation, stack);
    });

    sf.check.addCheck('equal', function(v1 , v2, explanation){

        if(v1 !== v2){
            if(!explanation){
                explanation =  " ["+ v1 + " != " + v2 + "]";
            }

            sf.exceptions.checkFail(explanation);
        }
    });


    sf.check.addCheck('true', function(b, explanation){
        if(!b){
            if(!explanation){
                explanation =  " expression is false but is expected to be true";
            }

            sf.exceptions.checkFail(explanation);
        }
    });


    sf.check.addCheck('false', function(b, explanation){
        if(b){
            if(!explanation){
                explanation =  " expression is true but is expected to be false";
            }

            sf.exceptions.checkFail(explanation);
        }
    });

    sf.check.addCheck('notequal', function(v1 , v2, explanation){
        if(v1 == v2){
            if(!explanation){
                explanation =  " ["+ v1 + " == " + v2 + "]";
            }
            sf.exceptions.checkFail(explanation);
        }
    });


    /*
        added mainly for test purposes, better test frameworks like mocha could be much better :)
    */
    sf.check.addCheck('fail', function(testName ,func){
        try{
            func();
            console.log("[Fail] " + testName );
        } catch(err){
            console.log("[Pass] " + testName );
        }
    });


    sf.check.addCheck('pass', function(testName ,func){
        try{
            func();
            console.log("[Pass] " + testName );
        } catch(err){
            console.log("[Fail] " + testName  ,  err.stack);
        }
    });


    sf.check.alias('test','pass');


    sf.check.addCheck('callback', function(testName ,func, timeout){
        if(!timeout){
            timeout = 500;
        }
        var passed = false;
        function callback(){
            if(!passed){
                passed = true;
                console.log("[Pass] " + testName );
                SuccessTest();
            } else {
                console.log("[Fail (multiple calls)] " + testName );
            }
        }
        try{
            func(callback);
        } catch(err){
            console.log("[Fail] " + testName  ,  err.stack);
        }

        function SuccessTest(force){
            if(!passed){
                console.log("[Fail Timeout] " + testName );
            }
        }

        setTimeout(SuccessTest, timeout);
    });


    sf.check.addCheck('steps', function(testName , arr, timeout){
        var  currentStep = 0;
        var passed = false;
        if(!timeout){
            timeout = 500;
        }

        function next(){
            if(currentStep === arr.length){
                passed = true;
                console.log("[Pass] " + testName );
                return ;
            }
            var func = arr[currentStep];
            currentStep++;
            try{
                func(next);
            } catch(err){
                console.log("[Fail] " + testName  ,"\n\t" , err.stack + "\n\t" , " [at step ", currentStep + "]");
            }
        }

        function SuccessTest(force){
            if(!passed){
                console.log("[Fail Timeout] " + testName + "\n\t" , " [at step ", currentStep+ "]");
            }
        }

        setTimeout(SuccessTest, timeout);
        next();
    });

    sf.check.alias('waterfall','steps');
    sf.check.alias('notEqual','notequal');

    sf.check.addCheck('end', function(timeOut, silence){
        if(!timeOut){
            timeOut = 1000;
        }

        setTimeout(function(){
            if(!silence){
                console.log("Forcing exit after", timeOut, "ms");
            }
            process.exit(0);
        }, timeOut);
    });


    sf.check.addCheck('begin', function(message, timeOut){
        console.log(message);
        sf.check.end(timeOut, true);
    });


};
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\standardExceptions.js":[function(require,module,exports){
exports.init = function(sf){
    /**
     * Registering unknown exception handler.
     */
    sf.exceptions.register('unknown', function(explanation){
        explanation = explanation || "";
        const message = "Unknown exception" + explanation;
        throw(message);
    });

    /**
     * Registering resend exception handler.
     */
    sf.exceptions.register('resend', function(exceptions){
        throw(exceptions);
    });

    /**
     * Registering notImplemented exception handler.
     */
    sf.exceptions.register('notImplemented', function(explanation){
        explanation = explanation || "";
        const message = "notImplemented exception" + explanation;
        throw(message);
    });

    /**
     * Registering security exception handler.
     */
    sf.exceptions.register('security', function(explanation){
        explanation = explanation || "";
        const message = "security exception" + explanation;
        throw(message);
    });

    /**
     * Registering duplicateDependency exception handler.
     */
    sf.exceptions.register('duplicateDependency', function(variable){
        variable = variable || "";
        const message = "duplicateDependency exception" + variable;
        throw(message);
    });
};
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\standardLogs.js":[function(require,module,exports){
const LOG_LEVELS = {
    HARD_ERROR: 0,  // system level critical error: hardError
    ERROR: 1,  // potentially causing user's data loosing error: error
    ASSERT_FAIL: 1,  // an assert fails
    LOG_ERROR: 2,  // minor annoyance, recoverable error:   logError
    UX_ERROR: 3,  // user experience causing issues error:  uxError
    WARN: 4,  // warning,possible isues but somehow unclear behaviour: warn
    INFO: 5,  // store general info about the system working: info
    DEBUG: 6,  // system level debug: debug
    LOCAL_DEBUG: 7,  // local node/service debug: ldebug
    USER_DEBUG: 8,  // user level debug; udebug
    DEV_DEBUG: 9,  // development time debug: ddebug
    WHYS: 10, // whyLog for code reasoning
    TEST_RESULT: 11, // testResult to log running tests
};

exports.init = function (sf) {

    /**
     * Records log messages from various use cases.
     * @param record {String} - log message.
     */
    sf.logger.record = function (record) {
        const triggerStrings = ["pskruntime", "double-check", "psklogger", "standardGlobalSymbols"];
        let displayOnConsole = true;
        if (process.send) {
            process.send(record);
            displayOnConsole = false;
        }

        function removeLines(str, nb) {
            function removeLine(str,  force) {
                let pos = str.indexOf("\n");
                let willBeRemoved = str.slice(0, pos);
                if (!force) {
                    let foundMatch = false;
                    for(let i=0; i< triggerStrings.length;i++){
                        let item = triggerStrings[i];
                        if (willBeRemoved.indexOf(item) != -1) {
                            foundMatch = true;
                        }
                    }
                    if (!foundMatch) {
                        throw foundMatch;
                    }
                }
                return str.slice(pos + 1, str.length);
            }

            let ret = str;
            for (let v = 0; v < nb; v++) {
                try {
                    ret = removeLine(ret, v==0);
                } catch (err) {
                    // nothing... exit for
                }
            }
            return "Stack:\n"+ret;
        }

        if (displayOnConsole) {
            //const prettyLog = JSON.stringify(record, null, 2);
            //console.log(prettyLog);
            console.log(record.message);
            if (record.stack) {
                var pos = record.stack.indexOf("\n");
                var message = record.stack.slice(0, pos);
                if(record.level<=LOG_LEVELS.ERROR){
                    console.error(message);
                    console.error(removeLines(record.stack, 3));
                } else {
                    console.log(message);
                    console.log(removeLines(record.stack, 3));
                }
            }
        }
    };

    /**
     * Adding case for logging system level critical errors.
     */
    sf.logger.addCase('hardError', function (message, exception, args, pos, data) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.HARD_ERROR, 'systemError', message, exception, true, args, pos, data));
    }, [
        {
            'message': 'explanation'
        }
    ]);

    /**
     * Adding case for logging potentially causing user's data loosing errors.
     */
    sf.logger.addCase('error', function (message, exception, args, pos, data) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.ERROR, 'error', message, exception, true, args, pos, data));
    }, [
        {
            'message': 'explanation'
        },
        {
            'exception': 'exception'
        }
    ]);

    /**
     * Adding case for logging minor annoyance, recoverable errors.
     */
    sf.logger.addCase('logError', function (message, exception, args, pos, data) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.LOG_ERROR, 'logError', message, exception, true, args, pos, data));
    }, [
        {
            'message': 'explanation'
        },
        {
            'exception': 'exception'
        }
    ]);

    /**
     * Adding case for logging user experience causing issues errors.
     */
    sf.logger.addCase('uxError', function (message) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.UX_ERROR, 'uxError', message, null, false));
    }, [
        {
            'message': 'explanation'
        }
    ]);

    /**
     * Adding case for logging throttling messages.
     */
    sf.logger.addCase('throttling', function (message) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.WARN, 'throttling', message, null, false));
    }, [
        {
            'message': 'explanation'
        }
    ]);

    /**
     * Adding case for logging warning, possible issues, but somehow unclear behaviours.
     */
    sf.logger.addCase('warning', function (message) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.WARN, 'warning', message, null, false, arguments, 0));
    }, [
        {
            'message': 'explanation'
        }
    ]);

    sf.logger.alias('warn', 'warning');

    /**
     * Adding case for logging general info about the system working.
     */
    sf.logger.addCase('info', function (message) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.INFO, 'info', message, null, false, arguments, 0));
    }, [
        {
            'message': 'explanation'
        }
    ]);

    /**
     * Adding case for logging system level debug messages.
     */
    sf.logger.addCase('debug', function (message) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.DEBUG, 'debug', message, null, false, arguments, 0));
    }, [
        {
            'message': 'explanation'
        }
    ]);


    /**
     * Adding case for logging local node/service debug messages.
     */
    sf.logger.addCase('ldebug', function (message) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.LOCAL_DEBUG, 'ldebug', message, null, false, arguments, 0));
    }, [
        {
            'message': 'explanation'
        }
    ]);

    /**
     * Adding case for logging user level debug messages.
     */
    sf.logger.addCase('udebug', function (message) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.USER_DEBUG, 'udebug', message, null, false, arguments, 0));
    }, [
        {
            'message': 'explanation'
        }
    ]);

    /**
     * Adding case for logging development debug messages.
     */
    sf.logger.addCase('devel', function (message) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.DEV_DEBUG, 'devel', message, null, false, arguments, 0));
    }, [
        {
            'message': 'explanation'
        }
    ]);

    /**
     * Adding case for logging "whys" reasoning messages.
     */
    sf.logger.addCase("logWhy", function (logOnlyCurrentWhyContext) {
        sf.logger.record(createDebugRecord(LOG_LEVELS.WHYS, 'logwhy', undefined, undefined, undefined, undefined, undefined, undefined, logOnlyCurrentWhyContext));
    });

    /**
     * Adding case for logging asserts messages to running tests.
     */
    sf.logger.addCase("recordAssert", function (message, error, showStack) {
        if(error || showStack){
            sf.logger.record(createDebugRecord(LOG_LEVELS.ASSERT_FAIL, 'assert', message, error, showStack));
        } else {
            sf.logger.record(createDebugRecord(LOG_LEVELS.TEST_RESULT, 'assert', message, error, showStack));
        }
    });

    /**
     * Generic method to create structured debug records based on the log level.
     * @param level {Number} - number from 1-11, used to identify the level of attention that a log entry should get from operations point of view
     * @param type {String} - identifier name for log type
     * @param message {String} - description of the debug record
     * @param exception {String} - exception details if any
     * @param saveStack {Boolean} - if set to true, the exception call stack will be added to the debug record
     * @param args {Array} - arguments of the caller function
     * @param pos {Number} - position
     * @param data {String|Number|Array|Object} - payload information
     * @param logOnlyCurrentWhyContext - if whys is enabled, only the current context will be logged
     * @returns Debug record model {Object} with the following fields:
     * [required]: level: *, type: *, timestamp: number, message: *, data: * and
     * [optional]: stack: *, exception: *, args: *, whyLog: *
     */
    function createDebugRecord(level, type, message, exception, saveStack, args, pos, data, logOnlyCurrentWhyContext) {

        var ret = {
            level: level,
            type: type,
            timestamp: (new Date()).getTime(),
            message: message
        };

        if(data){
            ret.data = data;
        }

        if (saveStack) {
            var stack = '';
            if (exception) {
                stack = exception.stack;
            } else {
                stack = (new Error()).stack;
            }
            ret.stack = stack;
        }

        if (exception) {
            ret.exception = exception.message;
        }

        if (args) {
            ret.args = JSON.parse(JSON.stringify(args));
        }

        if (process.env.RUN_WITH_WHYS) {
            var why = require('whys');
            if (logOnlyCurrentWhyContext) {
                ret['whyLog'] = why.getGlobalCurrentContext().getExecutionSummary();
            } else {
                ret['whyLog'] = why.getAllContexts().map(function (context) {
                    return context.getExecutionSummary();
                });
            }
        }
        return ret;
    }

}
;


},{"whys":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\utils\\glob-to-regexp.js":[function(require,module,exports){

// globToRegExp turns a UNIX glob expression into a RegEx expression.
//  Supports all simple glob patterns. Examples: *.ext, /foo/*, ../../path, ^foo.*
// - single character matching, matching ranges of characters etc. group matching are no supported
// - flags are not supported
var globToRegExp = function (globExp) {
    if (typeof globExp !== 'string') {
        throw new TypeError('Glob Expression must be a string!');
    }

    var regExp = "";

    for (let i = 0, len = globExp.length; i < len; i++) {
        let c = globExp[i];

        switch (c) {
            case "/":
            case "$":
            case "^":
            case "+":
            case ".":
            case "(":
            case ")":
            case "=":
            case "!":
            case "|":
                regExp += "\\" + c;
                break;

            case "*":
                // treat any number of "*" as one
                while(globExp[i + 1] === "*") {
                    i++;
                }
                regExp += ".*";
                break;

            default:
                regExp += c;
        }
    }

    // set the regular expression with ^ & $
    regExp = "^" + regExp + "$";

    return new RegExp(regExp);
};

module.exports = globToRegExp;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\utils\\AsyncDispatcher.js":[function(require,module,exports){

function AsyncDispatcher(finalCallback) {
	let results = [];
	let errors = [];

	let started = 0;

	function markOneAsFinished(err, res) {
		if(err) {
			errors.push(err);
		}

		if(arguments.length > 2) {
			arguments[0] = undefined;
			res = arguments;
		}

		if(typeof res !== "undefined") {
			results.push(res);
		}

		if(--started <= 0) {
            return callCallback();
		}
	}

	function dispatchEmpty(amount = 1) {
		started += amount;
	}

	function callCallback() {
	    if(errors && errors.length === 0) {
	        errors = undefined;
        }

	    if(results && results.length === 0) {
	        results = undefined;
        }

        finalCallback(errors, results);
    }

	return {
		dispatchEmpty,
		markOneAsFinished
	};
}

module.exports = AsyncDispatcher;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\brickTransportStrategies\\FetchBrickTransportStrategy.js":[function(require,module,exports){
(function (Buffer){

function FetchBrickTransportStrategy(initialConfig) {
    const url = initialConfig;
    this.send = (name, data, callback) => {

        fetch(url + "/EDFS/", {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
            body: data
        }).then(function(response) {
            if(response.status>=400){
                return callback(new Error(`An error occurred ${response.statusText}`))
            }
            return response.json();
        }).then(function(data) {
            callback(null, data)
        }).catch(error=>{
            callback(error);
        });

    };

    this.get = (name, callback) => {
        fetch(url + "/EDFS/"+name,{
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
        }).then(response=>{
            if(response.status>=400){
                return callback(new Error(`An error occurred ${response.statusText}`))
            }
            return response.arrayBuffer();
        }).then(arrayBuffer=>{
                let buffer = new Buffer(arrayBuffer.byteLength);
                let view = new Uint8Array(arrayBuffer);
                for (let i = 0; i < buffer.length; ++i) {
                    buffer[i] = view[i];
                }

            callback(null, buffer);
        }).catch(error=>{
            callback(error);
        });
    };

    this.getHashForAlias = (alias, callback) => {
        fetch(url + "/EDFS/getVersions/" + alias, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/octet-stream'
            },
        }).then(response => {
            if(response.status>=400){
                return callback(new Error(`An error occurred ${response.statusText}`))
            }
            return response.json().then(data => {
                callback(null, data);
            }).catch(error => {
                callback(error);
            })
        });
    };

    this.getLocator = () => {
        return url;
    };
}
//TODO:why we use this?
FetchBrickTransportStrategy.prototype.FETCH_BRICK_TRANSPORT_STRATEGY = "FETCH_BRICK_TRANSPORT_STRATEGY";


module.exports = FetchBrickTransportStrategy;

}).call(this,require("buffer").Buffer)

},{"buffer":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\brickTransportStrategies\\HTTPBrickTransportStrategy.js":[function(require,module,exports){

function HTTPBrickTransportStrategy(endpoint) {
    require("psk-http-client");

    this.send = (name, data, callback) => {
        $$.remote.doHttpPost(endpoint + "/EDFS/" + name, data, callback);
    };

    this.get = (name, callback) => {
        $$.remote.doHttpGet(endpoint + "/EDFS/" + name, callback);
    };

    this.getHashForAlias = (alias, callback) => {
        $$.remote.doHttpGet(endpoint + "/EDFS/getVersions/" + alias, (err, hashesList) => {
            if(err) {
                return callback(err)
            }

            callback(undefined, JSON.parse(hashesList.toString()))
        });
    };

    this.attachHashToAlias = (alias, name, callback) => {
        $$.remote.doHttpPost(endpoint + "/EDFS/attachHashToAlias/" + name, alias, callback);
    };

    this.getLocator = () => {
        return endpoint;
    };
}

HTTPBrickTransportStrategy.prototype.canHandleEndpoint = (endpoint) => {
    return endpoint.indexOf("http:") === 0 || endpoint.indexOf("https:") === 0;
};

module.exports = HTTPBrickTransportStrategy;
},{"psk-http-client":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\brickTransportStrategies\\brickTransportStrategiesRegistry.js":[function(require,module,exports){
function BrickTransportStrategiesRegistry() {
    const strategies = {};

    this.remove = (transportStrategyName) => {
        strategies[transportStrategyName] = undefined;
    };

    this.add = (transportStrategyName, strategy) => {
        if (typeof strategy.prototype.canHandleEndpoint === "function") {
            strategies[transportStrategyName] = strategy;
        } else {
            throw Error("Missing function from strategy prototype");
        }
    };

    this.get = (endpoint) => {
        if (typeof endpoint !== "string" || endpoint.length === 0) {
            throw Error("Invalid endpoint");
        }

        const strategyName = getStrategyNameFromEndpoint(endpoint);
        if (!strategyName) {
            throw Error(`No strategy available to handle endpoint ${endpoint}`);
        }

        return new strategies[strategyName](endpoint);
    };

    this.has = (transportStrategyName) => {
        return strategies.hasOwnProperty(transportStrategyName);
    };

    function getStrategyNameFromEndpoint(endpoint) {
        for(let key in strategies){
            if (strategies[key] && strategies[key].prototype.canHandleEndpoint(endpoint)) {
                return key;
            }
        }
    }
}

if (!$$.brickTransportStrategiesRegistry) {
    $$.brickTransportStrategiesRegistry = new BrickTransportStrategiesRegistry();
}
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\lib\\EDFS.js":[function(require,module,exports){
function EDFS(endpoint) {
    const RawDossier = require("./RawDossier");
    const barModule = require("bar");
    const fsAdapter = require("bar-fs-adapter");
    const constants = require('../moduleConstants');
    const self = this;

    this.createCSB = () => {
        return new RawDossier(endpoint);
    };

    this.createBar = () => {
        return barModule.createArchive(createArchiveConfig());
    };

    this.bootCSB = (seed, callback) => {
        const rawDossier = new RawDossier(endpoint, seed);
        rawDossier.start(err => callback(err, rawDossier));
    };

    this.loadBar = (seed) => {
        return barModule.createArchive(createArchiveConfig(seed));
    };

    this.clone = (seed, callback) => {
        const edfsBrickStorage = require("edfs-brick-storage").create(endpoint);
        const bar = this.loadBar(seed);
        bar.clone(edfsBrickStorage, true, callback);
    };

    this.createWallet = (templateSeed, pin, overwrite = false, callback) => {
        const wallet = this.createCSB();
        wallet.mount("/", constants.CSB.CONSTITUTION_FOLDER, templateSeed, (err => {
            if (err) {
                return callback(err);
            }

            const seed = wallet.getSeed();
            if (typeof pin !== "undefined") {
                require("../seedCage").putSeed(seed, pin, overwrite, (err) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(undefined, seed.toString());
                });
            } else {
                callback(undefined, seed.toString());
            }
        }));
    };

    this.loadWallet = function (walletSeed, pin, overwrite, callback) {
        if (typeof overwrite === "function") {
            callback = overwrite;
            overwrite = pin;
            pin = walletSeed;
            walletSeed = undefined;
        }
        if (typeof walletSeed === "undefined") {
            require("../seedCage").getSeed(pin, (err, seed) => {
                if (err) {
                    return callback(err);
                }
                this.bootCSB(seed, (err, wallet) => {
                    if (err) {
                        return callback(err);
                    }
                    return callback(undefined, wallet);
                });

            });
        } else {
           
            this.bootCSB(walletSeed, (err, wallet) => {
                if (err) {
                    return callback(err);
                }

                if (typeof pin !== "undefined" && pin !== null) {
                    require("../seedCage").putSeed(walletSeed, pin, overwrite, (err) => {
                        if (err) {
                            return callback(err);
                        }
                        callback(undefined, wallet);
                    });
                } else {
                    return callback(undefined, wallet);
                }
            });
        }
    };

    this.createBarWithConstitution = function (folderConstitution, callback) {
        const bar = this.createBar();
        bar.addFolder(folderConstitution, constants.CSB.CONSTITUTION_FOLDER, (err, mapDigest) => {
            if (err) {
                return callback(err);
            }

            callback(undefined, bar);
        });
    };

//------------------------------------------------ internal methods -------------------------------------------------
    function createArchiveConfig(seed) {
        const ArchiveConfigurator = barModule.ArchiveConfigurator;
        ArchiveConfigurator.prototype.registerFsAdapter("FsAdapter", fsAdapter.createFsAdapter);
        ArchiveConfigurator.prototype.registerStorageProvider("EDFSBrickStorage", require("edfs-brick-storage").create);
        const archiveConfigurator = new ArchiveConfigurator();
        archiveConfigurator.setFsAdapter("FsAdapter");
        archiveConfigurator.setStorageProvider("EDFSBrickStorage", endpoint);
        archiveConfigurator.setBufferSize(65535);
        archiveConfigurator.setEncryptionAlgorithm("aes-256-gcm");

        if (seed) {
            archiveConfigurator.setSeed(seed);
        } else {
            archiveConfigurator.setSeedEndpoint(endpoint);
        }

        return archiveConfigurator;
    }
}

module.exports = EDFS;
},{"../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\moduleConstants.js","../seedCage":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\seedCage\\index.js","./RawDossier":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\lib\\RawDossier.js","bar":false,"bar-fs-adapter":false,"edfs-brick-storage":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\lib\\RawDossier.js":[function(require,module,exports){
/*

Sinica: to be renamed CSBHandler. RootCSB should be deleted
*/

function RawDossier(endpoint, seed) {
    const barModule = require("bar");
    const constants = require("../moduleConstants").CSB;
    let bar = createBar(seed);
    this.getSeed = () => {
        return bar.getSeed();
    };

    this.start = (callback) => {
        createBlockchain(bar).start(callback);
    };

    this.addFolder = (fsFolderPath, barPath, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = {};
            options.encrypt = true;
        }

        if (options.depth === 0) {
            bar.addFolder(fsFolderPath, barPath, options, (err, barMapDigest) => callback(err, barMapDigest));
        } else {
            loadBarForPath(barPath, (err, dossierContext) => {
                if (err) {
                    return callback(err);
                }

                dossierContext.archive.addFolder(fsFolderPath, dossierContext.relativePath, options, callback);
            });
        }
    };

    this.addFile = (fsFilePath, barPath, options, callback) => {
        if (typeof options === "function") {
            callback = options;
            options = {};
            options.encrypt = true;
        }
        if (options.depth === 0) {
            bar.addFolder(fsFilePath, barPath, options, (err, barMapDigest) => callback(err, barMapDigest));
        } else {
            loadBarForPath(barPath, (err, dossierContext) => {
                if (err) {
                    return callback(err);
                }

                dossierContext.archive.addFile(fsFilePath, dossierContext.relativePath, options, callback);
            });
        }
    };

    this.readFile = (fileBarPath, callback) => {

        loadBarForPath(fileBarPath, (err, dossierContext) => {
            if (err) {
                return callback(err);
            }

            dossierContext.archive.readFile(dossierContext.relativePath, callback);
        });
    };

    this.extractFolder = (fsFolderPath, barPath, callback) => {
        loadBarForPath(barPath, (err, dossierContext) => {
            if (err) {
                return callback(err);
            }

            dossierContext.archive.extractFolder(fsFolderPath, dossierContext.relativePath, callback);
        });
    };

    this.extractFile = (fsFilePath, barPath, callback) => {
        loadBarForPath(barPath, (err, dossierContext) => {
            if (err) {
                return callback(err);
            }

            dossierContext.archive.extractFile(fsFilePath, dossierContext.relativePath, callback);
        });
    };

    this.writeFile = (path, data, depth, callback) => {
        if (typeof depth === "function") {
            callback = depth;
            depth = undefined;
        }

        if (depth === 0) {
            bar.writeFile(path, data, callback);
        } else {
            loadBarForPath(path, (err, dossierContext) => {
                if (err) {
                    return callback(err);
                }

                dossierContext.archive.writeFile(dossierContext.relativePath, data, callback);
            });
        }
    };

    this.listFiles = (path, callback) => {
        loadBarForPath(path, (err, dossierContext) => {
            if (err) {
                return callback(err);
            }

            dossierContext.archive.listFiles(dossierContext.relativePath, callback);
        });
    };

    this.mount = (path, name, archiveIdentifier, callback) => {
        bar.readFile(constants.MANIFEST_FILE, (err, data) => {
            let manifest;
            if (err) {
                manifest = {};
                manifest.mounts = [];
            }

            if (data) {
                manifest = JSON.parse(data.toString());
                const pathNames = manifest.mounts.filter(el => el.localPath === path);
                const index = pathNames.findIndex(el => el === name);
                if (index >= 0) {
                    return callback(Error(`A mount point at path ${path} with the name ${name} already exists.`));
                }
            }

            const mount = {};
            mount.localPath = path;
            mount.mountName = name;
            mount.archiveIdentifier = archiveIdentifier;

            manifest.mounts.push(mount);

            bar.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest), callback);
        });
    };

    this.unmount = (path, name, callback) => {
        bar.readFile(constants.MANIFEST_FILE, (err, data) => {
            if (err) {
                return callback(err);
            }

            if (data.length === 0) {
                return callback(Error("Nothing to unmount"));
            }

            const manifest = JSON.parse(data.toString());
            const index = manifest.mounts.findIndex(el => el.localPath === path);
            if (index >= 0) {
                manifest.mounts.splice(index, 1);
            } else {
                return callback(Error(`No mount point exists at path ${path}`));
            }

            bar.writeFile(constants.MANIFEST_FILE, JSON.stringify(manifest), callback);
        });
    };

    //------------------------------------------------- internal functions ---------------------------------------------
    function createBlockchain(bar) {
        const blockchainModule = require("blockchain");
        const worldStateCache = blockchainModule.createWorldStateCache("bar", bar);
        const historyStorage = blockchainModule.createHistoryStorage("bar", bar);
        const consensusAlgorithm = blockchainModule.createConsensusAlgorithm("direct");
        const signatureProvider = blockchainModule.createSignatureProvider("permissive");
        return blockchainModule.createBlockchain(worldStateCache, historyStorage, consensusAlgorithm, signatureProvider, true);
    }

    function createBar(localSeed) {
        const createEDFSBrickStorage = require("edfs-brick-storage").create;
        const createFsAdapter = require("bar-fs-adapter").createFsAdapter;

        const ArchiveConfigurator = barModule.ArchiveConfigurator;
        ArchiveConfigurator.prototype.registerStorageProvider("EDFSBrickStorage", createEDFSBrickStorage);
        ArchiveConfigurator.prototype.registerFsAdapter("FsAdapter", createFsAdapter);

        const archiveConfigurator = new ArchiveConfigurator();
        archiveConfigurator.setFsAdapter("FsAdapter");

        archiveConfigurator.setEncryptionAlgorithm("aes-256-gcm");
        archiveConfigurator.setBufferSize(65535);
        if (!localSeed) {
            archiveConfigurator.setStorageProvider("EDFSBrickStorage", endpoint);
            archiveConfigurator.setSeedEndpoint(endpoint);
        } else {
            archiveConfigurator.setSeed(localSeed);
        }

        return barModule.createArchive(archiveConfigurator);
    }

    function loadBarForPath(path, callback) {
        __loadBarForPathRecursively(bar, "", path, callback);

        function __loadBarForPathRecursively(archive, prefixPath, relativePath, callback) {
            archive.listFiles((err, files) => {
                if (err) {
                    return callback(err);
                }

                if (files.length === 0) {
                    return callback();
                }

                let pathRest = [];

                let barPath = files.find(file => {
                    let pth;
                    if (relativePath[0] === "/") {
                        if (prefixPath === "/") {
                            pth = relativePath;
                        } else {
                            pth = prefixPath + relativePath
                        }
                    } else {
                        if (prefixPath === "/") {
                            pth = prefixPath + relativePath;
                        } else {
                            pth = prefixPath + "/" + relativePath;
                        }
                    }
                    return file.startsWith(pth);
                });
                if (barPath) {
                    return callback(undefined, {archive, prefixPath, relativePath});
                } else {
                    let splitPath = relativePath.split("/");
                    if (splitPath[0] === "") {
                        splitPath[0] = "/";
                    }
                    archive.readFile(constants.MANIFEST_FILE, (err, manifestContent) => {
                        if (err) {
                            return callback(err);
                        }

                        const manifest = JSON.parse(manifestContent.toString());
                        pathRest.unshift(splitPath.pop());
                        while (splitPath.length > 0) {
                            let localPath;
                            if (splitPath[0] === "/") {
                                splitPath.shift();
                                localPath = "/" + splitPath.join("/");
                                splitPath.unshift("/");
                            } else {
                                localPath = splitPath.join("/");
                            }

                            for (let mount of manifest.mounts) {
                                const name = pathRest[0];
                                if (mount.localPath === localPath && mount.mountName === name) {
                                    const internalArchive = createBar(mount.archiveIdentifier);
                                    return __loadBarForPathRecursively(internalArchive, splitPath.join("/"), pathRest.join("/"), callback);
                                }
                            }

                            pathRest.unshift(splitPath.pop());
                        }
                    });
                }
            });
        }
    }
}

module.exports = RawDossier;
},{"../moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\moduleConstants.js","bar":false,"bar-fs-adapter":false,"blockchain":"blockchain","edfs-brick-storage":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\moduleConstants.js":[function(require,module,exports){
const HTTPBrickTransportStrategy = require("./brickTransportStrategies/HTTPBrickTransportStrategy");
HTTPBrickTransportStrategy.prototype.HTTP_BRICK_TRANSPORT_STRATEGY = "HTTP_BRICK_TRANSPORT_STRATEGY";

module.exports = {
    CSB: {
        CONSTITUTION_FOLDER: 'constitution',
        BLOCKCHAIN_FOLDER: 'blockchain',
        APP_FOLDER: 'app',
        DOMAIN_IDENTITY_FILE: 'domain_identity',
        ASSETS_FOLDER: "assets",
        TRANSACTIONS_FOLDER: "transactions",
        APPS_FOLDER: "apps",
        DATA_FOLDER: "data",
        MANIFEST_FILE: "manifest"
    }
};

},{"./brickTransportStrategies/HTTPBrickTransportStrategy":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\brickTransportStrategies\\HTTPBrickTransportStrategy.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\seedCage\\BrowserSeedCage.js":[function(require,module,exports){
(function (Buffer){
const pskcrypto = "pskcrypto";
const crypto = require(pskcrypto);
const storageLocation = "seedCage";
const algorithm = "aes-256-cfb";

/**
 * local storage can't handle properly binary data
 *  https://stackoverflow.com/questions/52419694/how-to-store-uint8array-in-the-browser-with-localstorage-using-javascript
 * @param pin
 * @param callback
 * @returns {*}
 */
function getSeed(pin, callback) {
    let encryptedSeed;
    let seed;
    try {
        encryptedSeed = localStorage.getItem(storageLocation);
        if (encryptedSeed === null || typeof encryptedSeed !== "string" || encryptedSeed.length === 0) {
            return callback(new Error("SeedCage is empty or data was altered"));
        }

        const retrievedEncryptedArr = JSON.parse(encryptedSeed);
        encryptedSeed = new Uint8Array(retrievedEncryptedArr);
        const pskEncryption = crypto.createPskEncryption(algorithm);
        const encKey = crypto.deriveKey(algorithm, pin);
        seed = pskEncryption.decrypt(encryptedSeed, encKey).toString();
    } catch (e) {
        return callback(e);
    }
    callback(undefined, seed);
}

function putSeed(seed, pin, overwrite = false, callback) {
    let encSeed;

    if (typeof overwrite === "function") {
        callback(Error("TODO: api signature updated!"));
    }
    try {
        if (typeof seed === "string") {
            seed = Buffer.from(seed);
        }
        if (typeof seed === "object" && !Buffer.isBuffer(seed)) {
            seed = Buffer.from(seed);
        }

        const pskEncryption = crypto.createPskEncryption(algorithm);
        const encKey = crypto.deriveKey(algorithm, pin);
        encSeed = pskEncryption.encrypt(seed, encKey);
        const encParameters = pskEncryption.getEncryptionParameters();
        encSeed = Buffer.concat([encSeed, encParameters.iv]);
        if (encParameters.aad) {
            encSeed = Buffer.concat([encSeed, encParameters.aad]);
        }

        if (encParameters.tag) {
            encSeed = Buffer.concat([encSeed, encParameters.tag]);
        }

        const encryptedArray =  Array.from(encSeed);
        const encryptedSeed = JSON.stringify(encryptedArray);

        localStorage.setItem(storageLocation, encryptedSeed);
    } catch (e) {
        return callback(e);
    }
    callback(undefined);
}

function check(callback) {
    let item;
    try {
        item = localStorage.getItem(storageLocation);
    } catch (e) {
        return callback(e);
    }
    if (item) {
        return callback();
    }
    callback(new Error("SeedCage does not exists"));
}

module.exports = {
    check,
    putSeed,
    getSeed
};

}).call(this,require("buffer").Buffer)

},{"buffer":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\seedCage\\NodeSeedCage.js":[function(require,module,exports){
(function (Buffer){
const pth = "path";
const path = require(pth);
const os = "os";
const fileSystem = "fs";
const fs = require(fileSystem);
const pskcrypto = "pskcrypto";
const crypto = require(pskcrypto);


const storageLocation = process.env.SEED_CAGE_LOCATION || require(os).homedir();
const storageFileName = ".seedCage";
const seedCagePath = path.join(storageLocation, storageFileName);
const algorithm = "aes-256-cfb";

function getSeed(pin, callback) {
    fs.readFile(seedCagePath, (err, encryptedSeed) => {
        if (err) {
            return callback(err);
        }

        let seed;
        try {
            const pskEncryption = crypto.createPskEncryption(algorithm);
            const encKey = crypto.deriveKey(algorithm, pin);
            seed = pskEncryption.decrypt(encryptedSeed, encKey).toString();
        } catch (e) {
            return callback(e);
        }

        callback(undefined, seed);
    });
}

function putSeed(seed, pin, overwrite = false, callback) {
    fs.mkdir(storageLocation, {recursive: true}, (err) => {
        if (err) {
            return callback(err);
        }

        fs.stat(seedCagePath, (err, stats) => {
            if (!err && stats.size > 0) {
                if (overwrite) {
                    __encryptSeed();
                } else {
                    return callback(Error("Attempted to overwrite existing SEED."));
                }
            } else {
                __encryptSeed();
            }

            function __encryptSeed() {
                let encSeed;
                try {
                    if (typeof seed === "string") {
                        seed = Buffer.from(seed);
                    }

                    if (typeof seed === "object" && !Buffer.isBuffer(seed)) {
                        seed = Buffer.from(seed);
                    }


                    const pskEncryption = crypto.createPskEncryption(algorithm);
                    const encKey = crypto.deriveKey(algorithm, pin);
                    encSeed = pskEncryption.encrypt(seed, encKey);
                    const encParameters = pskEncryption.getEncryptionParameters();
                    encSeed = Buffer.concat([encSeed, encParameters.iv]);
                    if (encParameters.aad) {
                        encSeed = Buffer.concat([encSeed, encParameters.aad]);
                    }

                    if (encParameters.tag) {
                        encSeed = Buffer.concat([encSeed, encParameters.tag]);
                    }
                } catch (e) {
                    return callback(e);
                }

                console.log("To be removed later", seed.toString());
                fs.writeFile(seedCagePath, encSeed, callback);
            }
        });
    });
}

function check(callback) {
    fs.access(seedCagePath, callback);
}

module.exports = {
    check,
    putSeed,
    getSeed
};

}).call(this,require("buffer").Buffer)

},{"buffer":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\seedCage\\index.js":[function(require,module,exports){
const or = require("overwrite-require");
switch ($$.environmentType) {
    case or.constants.THREAD_ENVIRONMENT_TYPE:
    case or.constants.NODEJS_ENVIRONMENT_TYPE:
        module.exports = require("./NodeSeedCage");
        break;
    case or.constants.BROWSER_ENVIRONMENT_TYPE:
        module.exports = require("./BrowserSeedCage");
        break;
    case or.constants.SERVICE_WORKER_ENVIRONMENT_TYPE:
    case or.constants.ISOLATE_ENVIRONMENT_TYPE:
    default:
        throw new Error("No implementation of SeedCage for this env type.");
}
},{"./BrowserSeedCage":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\seedCage\\BrowserSeedCage.js","./NodeSeedCage":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\seedCage\\NodeSeedCage.js","overwrite-require":"overwrite-require"}],"D:\\Catalin\\Munca\\privatesky\\modules\\overwrite-require\\moduleConstants.js":[function(require,module,exports){
module.exports = {
  BROWSER_ENVIRONMENT_TYPE: 'browser',
  SERVICE_WORKER_ENVIRONMENT_TYPE: 'service-worker',
  ISOLATE_ENVIRONMENT_TYPE: 'isolate',
  THREAD_ENVIRONMENT_TYPE: 'thread',
  NODEJS_ENVIRONMENT_TYPE: 'nodejs'
};

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\overwrite-require\\standardGlobalSymbols.js":[function(require,module,exports){
(function (global){
let logger = console;

if (!global.process || process.env.NO_LOGS !== 'true') {
    try {
        const PSKLoggerModule = require('psklogger');
        const PSKLogger = PSKLoggerModule.PSKLogger;

        logger = PSKLogger.getLogger();

        console.log('Logger init successful', process.pid);
    } catch (e) {
        if(e.message.indexOf("psklogger")!==-1){
            console.log('Logger not available, using console');
            logger = console;
        }else{
            console.log(e);
        }
    }
} else {
    console.log('Environment flag NO_LOGS is set, logging to console');
}

$$.registerGlobalSymbol = function (newSymbol, value) {
    if (typeof $$[newSymbol] == "undefined") {
        Object.defineProperty($$, newSymbol, {
            value: value,
            writable: false
        });
    } else {
        logger.error("Refusing to overwrite $$." + newSymbol);
    }
};

console.warn = (...args)=>{
    console.log(...args);
};

/**
 * @method
 * @name $$#autoThrow
 * @param {Error} err
 * @throws {Error}
 */

$$.registerGlobalSymbol("autoThrow", function (err) {
    if (!err) {
        throw err;
    }
});

/**
 * @method
 * @name $$#propagateError
 * @param {Error} err
 * @param {function} callback
 */
$$.registerGlobalSymbol("propagateError", function (err, callback) {
    if (err) {
        callback(err);
        throw err; //stop execution
    }
});

/**
 * @method
 * @name $$#logError
 * @param {Error} err
 */
$$.registerGlobalSymbol("logError", function (err) {
    if (err) {
        console.log(err);
        $$.err(err);
    }
});

/**
 * @method
 * @name $$#fixMe
 * @param {...*} args
 */
console.log("Fix the fixMe to not display on console but put in logs");
$$.registerGlobalSymbol("fixMe", function (...args) {
    //$$.log(...args);
});

/**
 * @method - Throws an error
 * @name $$#exception
 * @param {string} message
 * @param {*} type
 */
$$.registerGlobalSymbol("exception", function (message, type) {
    throw new Error(message);
});

/**
 * @method - Throws an error
 * @name $$#throw
 * @param {string} message
 * @param {*} type
 */
$$.registerGlobalSymbol("throw", function (message, type) {
    throw new Error(message);
});


/**
 * @method - Warns that method is not implemented
 * @name $$#incomplete
 * @param {...*} args
 */
/* signal a  planned feature but not implemented yet (during development) but
also it could remain in production and should be flagged asap*/
$$.incomplete = function (...args) {
    args.unshift("Incomplete feature touched:");
    logger.warn(...args);
};

/**
 * @method - Warns that method is not implemented
 * @name $$#notImplemented
 * @param {...*} args
 */
$$.notImplemented = $$.incomplete;


/**
 * @method Throws if value is false
 * @name $$#assert
 * @param {boolean} value - Value to assert against
 * @param {string} explainWhy - Reason why assert failed (why value is false)
 */
/* used during development and when trying to discover elusive errors*/
$$.registerGlobalSymbol("assert", function (value, explainWhy) {
    if (!value) {
        throw new Error("Assert false " + explainWhy);
    }
});

/**
 * @method
 * @name $$#flags
 * @param {string} flagName
 * @param {*} value
 */
/* enable/disabale flags that control psk behaviour*/
$$.registerGlobalSymbol("flags", function (flagName, value) {
    $$.incomplete("flags handling not implemented");
});

/**
 * @method - Warns that a method is obsolete
 * @name $$#obsolete
 * @param {...*} args
 */
$$.registerGlobalSymbol("obsolete", function (...args) {
    args.unshift("Obsolete feature:");
    logger.log(...args);
    console.log(...args);
});

/**
 * @method - Uses the logger to log a message of level "log"
 * @name $$#log
 * @param {...*} args
 */
$$.registerGlobalSymbol("log", function (...args) {
    args.unshift("Log:");
    logger.log(...args);
});

/**
 * @method - Uses the logger to log a message of level "info"
 * @name $$#info
 * @param {...*} args
 */
$$.registerGlobalSymbol("info", function (...args) {
    args.unshift("Info:");
    logger.log(...args);
    console.log(...args);
});

/**
 * @method - Uses the logger to log a message of level "error"
 * @name $$#err
 * @param {...*} args
 */
$$.registerGlobalSymbol("err", function (...args) {
    args.unshift("Error:");
    logger.error(...args);
    console.error(...args);
});

/**
 * @method - Uses the logger to log a message of level "error"
 * @name $$#err
 * @param {...*} args
 */
$$.registerGlobalSymbol("error", function (...args) {
    args.unshift("Error:");
    logger.error(...args);
    console.error(...args);
});

/**
 * @method - Uses the logger to log a message of level "warning"
 * @name $$#warn
 * @param {...*} args
 */
$$.registerGlobalSymbol("warn", function (...args) {
    args.unshift("Warn:");
    logger.warn(...args);
    console.log(...args);
});

/**
 * @method - Uses the logger to log a message of level "syntexError"
 * @name $$#syntexError
 * @param {...*} args
 */
$$.registerGlobalSymbol("syntaxError", function (...args) {
    args.unshift("Syntax error:");
    logger.error(...args);
    try{
        throw new Error("Syntax error or misspelled symbol!");
    }catch(err){
        console.error(...args);
        console.error(err.stack);
    }

});

/**
 * @method - Logs an invalid member name for a swarm
 * @name $$#invalidMemberName
 * @param {string} name
 * @param {Object} swarm
 */
$$.invalidMemberName = function (name, swarm) {
    let swarmName = "unknown";
    if (swarm && swarm.meta) {
        swarmName = swarm.meta.swarmTypeName;
    }
    const text = "Invalid member name " + name + "in swarm " + swarmName;
    console.error(text);
    logger.err(text);
};

/**
 * @method - Logs an invalid swarm name
 * @name $$#invalidSwarmName
 * @param {string} name
 * @param {Object} swarm
 */
$$.registerGlobalSymbol("invalidSwarmName", function (swarmName) {
    const text = "Invalid swarm name " + swarmName;
    console.error(text);
    logger.err(text);
});

/**
 * @method - Logs unknown exceptions
 * @name $$#unknownException
 * @param {...*} args
 */
$$.registerGlobalSymbol("unknownException", function (...args) {
    args.unshift("unknownException:");
    logger.err(...args);
    console.error(...args);
});

/**
 * @method - PrivateSky event, used by monitoring and statistics
 * @name $$#event
 * @param {string} event
 * @param {...*} args
 */
$$.registerGlobalSymbol("event", function (event, ...args) {
    if (logger.hasOwnProperty('event')) {
        logger.event(event, ...args);
    } else {
        if(event === "status.domains.boot"){
            console.log("Failing to console...", event, ...args);
        }
    }
});

/**
 * @method -
 * @name $$#redirectLog
 * @param {string} event
 * @param {...*} args
 */
$$.registerGlobalSymbol("redirectLog", function (logType, logObject) {
    if(logger.hasOwnProperty('redirect')) {
        logger.redirect(logType, logObject);
    }
});

/**
 * @method - log throttling event // it is just an event?
 * @name $$#throttlingEvent
 * @param {...*} args
 */
$$.registerGlobalSymbol("throttlingEvent", function (...args) {
    logger.log(...args);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"psklogger":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\index.js":[function(require,module,exports){
//to look nice the requireModule on Node
require("./lib/psk-abstract-client");
const or = require('overwrite-require');
if ($$.environmentType === or.constants.BROWSER_ENVIRONMENT_TYPE) {
	require("./lib/psk-browser-client");
} else {
	require("./lib/psk-node-client");
}
},{"./lib/psk-abstract-client":"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\lib\\psk-abstract-client.js","./lib/psk-browser-client":"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\lib\\psk-browser-client.js","./lib/psk-node-client":"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\lib\\psk-node-client.js","overwrite-require":"overwrite-require"}],"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\lib\\psk-abstract-client.js":[function(require,module,exports){
/**********************  utility class **********************************/
function RequestManager(pollingTimeOut) {
    if (!pollingTimeOut) {
        pollingTimeOut = 1000; //1 second by default
    }

    const self = this;

    function Request(endPoint, initialSwarm, delayedStart) {
        let onReturnCallbacks = [];
        let onErrorCallbacks = [];
        let onCallbacks = [];
        const requestId = initialSwarm ? initialSwarm.meta.requestId : "weneedarequestid";
        initialSwarm = null;

        this.getRequestId = function () {
            return requestId;
        };

        this.on = function (phaseName, callback) {
            if (typeof phaseName != "string" && typeof callback != "function") {
                throw new Error("The first parameter should be a string and the second parameter should be a function");
            }

            onCallbacks.push({
                callback: callback,
                phase: phaseName
            });

            if (typeof delayedStart === "undefined") {
                self.poll(endPoint, this);
            }

            return this;
        };

        this.onReturn = function (callback) {
            onReturnCallbacks.push(callback);
            if (typeof delayedStart === "undefined") {
                self.poll(endPoint, this);
            }
            return this;
        };

        this.onError = function (callback) {
            if (onErrorCallbacks.indexOf(callback) !== -1) {
                onErrorCallbacks.push(callback);
            } else {
                console.log("Error callback already registered!");
            }
        };

        this.start = function () {
            if (typeof delayedStart !== "undefined") {
                self.poll(endPoint, this);
            }
        };

        this.dispatch = function (err, result) {
            if (result instanceof ArrayBuffer) {
                result = SwarmPacker.unpack(result);
            }

            result = typeof result === "string" ? JSON.parse(result) : result;

            result = OwM.prototype.convert(result);
            const resultReqId = result.getMeta("requestId");
            const phaseName = result.getMeta("phaseName");
            let onReturn = false;

            if (resultReqId === requestId) {
                onReturnCallbacks.forEach(function (c) {
                    c(null, result);
                    onReturn = true;
                });
                if (onReturn) {
                    onReturnCallbacks = [];
                    onErrorCallbacks = [];
                }

                onCallbacks.forEach(function (i) {
                    //console.log("XXXXXXXX:", phaseName , i);
                    if (phaseName === i.phase || i.phase === '*') {
                        i.callback(err, result);
                    }
                });
            }

            if (onReturnCallbacks.length === 0 && onCallbacks.length === 0) {
                self.unpoll(endPoint, this);
            }
        };

        this.dispatchError = function (err) {
            for (let i = 0; i < onErrorCallbacks.length; i++) {
                const errCb = onErrorCallbacks[i];
                errCb(err);
            }
        };

        this.off = function () {
            self.unpoll(endPoint, this);
        };
    }

    this.createRequest = function (remoteEndPoint, swarm, delayedStart) {
        return new Request(remoteEndPoint, swarm, delayedStart);
    };

    /* *************************** polling zone ****************************/

    const pollSet = {};

    const activeConnections = {};

    this.poll = function (remoteEndPoint, request) {
        let requests = pollSet[remoteEndPoint];
        if (!requests) {
            requests = {};
            pollSet[remoteEndPoint] = requests;
        }
        requests[request.getRequestId()] = request;
        pollingHandler();
    };

    this.unpoll = function (remoteEndPoint, request) {
        const requests = pollSet[remoteEndPoint];
        if (requests) {
            delete requests[request.getRequestId()];
            if (Object.keys(requests).length === 0) {
                delete pollSet[remoteEndPoint];
            }
        } else {
            console.log("Unpolling wrong request:", remoteEndPoint, request);
        }
    };

    function createPollThread(remoteEndPoint) {
        function reArm() {
            $$.remote.doHttpGet(remoteEndPoint, function (err, res) {
                let requests = pollSet[remoteEndPoint];
                if (err) {
                    for (const req_id in requests) {
                        if (!requests.hasOwnProperty(req_id)) {
                            return;
                        }

                        let err_handler = requests[req_id].dispatchError;
                        if (err_handler) {
                            err_handler(err);
                        }
                    }
                    activeConnections[remoteEndPoint] = false;
                } else {

                    for (const k in requests) {
                        if (!requests.hasOwnProperty(k)) {
                            return;
                        }

                        requests[k].dispatch(null, res);
                    }

                    if (Object.keys(requests).length !== 0) {
                        reArm();
                    } else {
                        delete activeConnections[remoteEndPoint];
                        console.log("Ending polling for ", remoteEndPoint);
                    }
                }
            });
        }

        reArm();
    }

    function pollingHandler() {
        let setTimer = false;
        for (const remoteEndPoint in pollSet) {
            if (!pollSet.hasOwnProperty(remoteEndPoint)) {
                return;
            }

            if (!activeConnections[remoteEndPoint]) {
                createPollThread(remoteEndPoint);
                activeConnections[remoteEndPoint] = true;
            }
            setTimer = true;
        }
        if (setTimer) {
            setTimeout(pollingHandler, pollingTimeOut);
        }
    }

    setTimeout(pollingHandler, pollingTimeOut);
}

function urlEndWithSlash(url) {
    if (url[url.length - 1] !== "/") {
        url += "/";
    }
    return url;
}

/********************** main APIs on working with virtualMQ channels **********************************/
function HttpChannelClient(remoteEndPoint, channelName, options) {

    let clientType;
    const opts = {
        autoCreate: true,
        publicSignature: "no_signature_provided"
    };

    Object.keys(options).forEach((optName) => {
        opts[optName] = options[optName];
    });

    let channelCreated = false;
    function readyToBeUsed(){
        let res = false;

        if(clientType === HttpChannelClient.prototype.PRODUCER_CLIENT_TYPE){
            res = true;
        }
        if(clientType === HttpChannelClient.prototype.CONSUMER_CLIENT_TYPE){
            if(!options.autoCreate){
                res = true;
            }else{
                res = channelCreated;
            }
        }

        return res;
    }

    function encryptChannelName(channelName) {
        return $$.remote.base64Encode(channelName);
    }

    function CatchAll(swarmName, phaseName, callback) { //same interface as Request
        const requestId = requestsCounter++;
        this.getRequestId = function () {
            return "swarmName" + "phaseName" + requestId;
        };

        this.dispatch = function (err, result) {
            /*result = OwM.prototype.convert(result);
            const currentPhaseName = result.getMeta("phaseName");
            const currentSwarmName = result.getMeta("swarmTypeName");
            if ((currentSwarmName === swarmName || swarmName === '*') && (currentPhaseName === phaseName || phaseName === '*')) {
                return callback(err, result);
            }*/
            return callback(err, result);
        };
    }

    this.setSenderMode = function () {
        if (typeof clientType !== "undefined") {
            throw new Error(`HttpChannelClient is set as ${clientType}`);
        }
        clientType = HttpChannelClient.prototype.PRODUCER_CLIENT_TYPE;

        this.sendSwarm = function (swarmSerialization) {
            $$.remote.doHttpPost(getRemoteToSendMessage(remoteEndPoint, channelName), swarmSerialization, (err, res)=>{
                if(err){
                    console.log("Sending swarm failed", err);
                }else{
                    console.log("Swarm sent");
                }
            });
        };
    };

    this.setReceiverMode = function () {
        if (typeof clientType !== "undefined") {
            throw new Error(`HttpChannelClient is set as ${clientType}`);
        }
        clientType = HttpChannelClient.prototype.CONSUMER_CLIENT_TYPE;

        function createChannel(callback){
            if (!readyToBeUsed()) {
                $$.remote.doHttpPut(getRemoteToCreateChannel(), opts.publicSignature, (err) => {
                    if (err) {
                        if (err.statusCode !== 409) {
                            return callback(err);
                        }
                    }
                    channelCreated = true;
                    if(opts.enableForward){
                        console.log("Enabling forward");
                        $$.remote.doHttpPost(getUrlToEnableForward(), opts.publicSignature, (err, res)=>{
                            if(err){
                                console.log("Request to enable forward to zeromq failed", err);
                            }
                        });
                    }
                    return callback();
                });
            }
        }

        this.getReceiveAddress = function(){
            return getRemoteToSendMessage();
        };

        this.on = function (swarmId, swarmName, phaseName, callback) {
            const c = new CatchAll(swarmName, phaseName, callback);
            allCatchAlls.push({
                s: swarmName,
                p: phaseName,
                c: c
            });

           /* if (!readyToBeUsed()) {
                createChannel((err)=>{
                    $$.remote.requestManager.poll(getRemoteToReceiveMessage(), c);
                });
            } else {*/
                $$.remote.requestManager.poll(getRemoteToReceiveMessage(), c);
            /*}*/
        };

        this.off = function (swarmName, phaseName) {
            allCatchAlls.forEach(function (ca) {
                if ((ca.s === swarmName || swarmName === '*') && (phaseName === ca.p || phaseName === '*')) {
                    $$.remote.requestManager.unpoll(getRemoteToReceiveMessage(remoteEndPoint, domainInfo.domain), ca.c);
                }
            });
        };

        createChannel((err) => {
            if(err){
                console.log(err);
            }
        });

        createRequestManager();
    };

    const allCatchAlls = [];
    let requestsCounter = 0;

    this.uploadCSB = function (cryptoUid, binaryData, callback) {
        $$.remote.doHttpPost(baseOfRemoteEndPoint + "/CSB/" + cryptoUid, binaryData, callback);
    };

    this.downloadCSB = function (cryptoUid, callback) {
        $$.remote.doHttpGet(baseOfRemoteEndPoint + "/CSB/" + cryptoUid, callback);
    };

    function getRemoteToReceiveMessage() {
        return [urlEndWithSlash(remoteEndPoint), urlEndWithSlash(HttpChannelClient.prototype.RECEIVE_API_NAME), urlEndWithSlash(encryptChannelName(channelName))].join("");
    }

    function getRemoteToSendMessage() {
        return [urlEndWithSlash(remoteEndPoint), urlEndWithSlash(HttpChannelClient.prototype.SEND_API_NAME), urlEndWithSlash(encryptChannelName(channelName))].join("");
    }

    function getRemoteToCreateChannel() {
        return [urlEndWithSlash(remoteEndPoint), urlEndWithSlash(HttpChannelClient.prototype.CREATE_CHANNEL_API_NAME), urlEndWithSlash(encryptChannelName(channelName))].join("");
    }

    function getUrlToEnableForward() {
        return [urlEndWithSlash(remoteEndPoint), urlEndWithSlash(HttpChannelClient.prototype.FORWARD_CHANNEL_API_NAME), urlEndWithSlash(encryptChannelName(channelName))].join("");
    }
}

/********************** constants **********************************/
HttpChannelClient.prototype.RECEIVE_API_NAME = "receive-message";
HttpChannelClient.prototype.SEND_API_NAME = "send-message";
HttpChannelClient.prototype.CREATE_CHANNEL_API_NAME = "create-channel";
HttpChannelClient.prototype.FORWARD_CHANNEL_API_NAME = "forward-zeromq";
HttpChannelClient.prototype.PRODUCER_CLIENT_TYPE = "producer";
HttpChannelClient.prototype.CONSUMER_CLIENT_TYPE = "consumer";

/********************** initialisation stuff **********************************/
if (typeof $$ === "undefined") {
    $$ = {};
}

if (typeof $$.remote === "undefined") {
    $$.remote = {};

    function createRequestManager(timeOut) {
        const newRequestManager = new RequestManager(timeOut);
        Object.defineProperty($$.remote, "requestManager", {value: newRequestManager});
    }

    function registerHttpChannelClient(alias, remoteEndPoint, channelName, options) {
        $$.remote[alias] = new HttpChannelClient(remoteEndPoint, channelName, options);
    }

    Object.defineProperty($$.remote, "createRequestManager", {value: createRequestManager});
    Object.defineProperty($$.remote, "registerHttpChannelClient", {value: registerHttpChannelClient});

    $$.remote.doHttpPost = function (url, data, callback) {
        throw new Error("Overwrite this!");
    };

    $$.remote.doHttpPut = function (url, data, callback) {
        throw new Error("Overwrite this!");
    };

    $$.remote.doHttpGet = function doHttpGet(url, callback) {
        throw new Error("Overwrite this!");
    };

    $$.remote.base64Encode = function base64Encode(stringToEncode) {
        throw new Error("Overwrite this!");
    };

    $$.remote.base64Decode = function base64Decode(encodedString) {
        throw new Error("Overwrite this!");
    };
}
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\lib\\psk-browser-client.js":[function(require,module,exports){
(function (Buffer){
function generateMethodForRequestWithData(httpMethod) {
    return function (url, data, callback) {
        const xhr = new XMLHttpRequest();

        xhr.onload = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                const data = xhr.response;
                callback(null, data);
            } else {
                if(xhr.status>=400){
                    const error = new Error("An error occured. StatusCode: " + xhr.status);
                    callback({error: error, statusCode: xhr.status});
                } else {
                    console.log(`Status code ${xhr.status} received, response is ignored.`);
                }
            }
        };

        xhr.onerror = function (e) {
            callback(new Error("A network error occurred"));
        };

        xhr.open(httpMethod, url, true);
        //xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        if(data && data.pipe && typeof data.pipe === "function"){
            const buffers = [];
            data.on("data", function(data) {
                buffers.push(data);
            });
            data.on("end", function() {
                const actualContents = Buffer.concat(buffers);
                xhr.send(actualContents);
            });
        }
        else {
            if(ArrayBuffer.isView(data) || data instanceof ArrayBuffer) {
                xhr.setRequestHeader('Content-Type', 'application/octet-stream');

                /**
                 * Content-Length is an unsafe header and we cannot set it.
                 * When browser is making a request that is intercepted by a service worker,
                 * the Content-Length header is not set implicitly.
                 */
                xhr.setRequestHeader('X-Content-Length', data.byteLength);
            }
            xhr.send(data);
        }
    };
}


$$.remote.doHttpPost = generateMethodForRequestWithData('POST');

$$.remote.doHttpPut = generateMethodForRequestWithData('PUT');


$$.remote.doHttpGet = function doHttpGet(url, callback) {

    var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function () {
        //check if headers were received and if any action should be performed before receiving data
        if (xhr.readyState === 2) {
            var contentType = xhr.getResponseHeader("Content-Type");
            if (contentType === "application/octet-stream") {
                xhr.responseType = 'arraybuffer';
            }
        }
    };

    xhr.onload = function () {

        if (xhr.readyState === 4 && xhr.status == "200") {
            var contentType = xhr.getResponseHeader("Content-Type");

            if (contentType === "application/octet-stream") {
                let responseBuffer = this.response;

                let buffer = new Buffer(responseBuffer.byteLength);
                let view = new Uint8Array(responseBuffer);
                for (let i = 0; i < buffer.length; ++i) {
                    buffer[i] = view[i];
                }
                callback(null, buffer);
            }
            else{
                callback(null, xhr.response);
            }

        } else {
            const error = new Error("An error occurred. StatusCode: " + xhr.status);

            callback({error: error, statusCode: xhr.status});
        }
    };
    xhr.onerror = function (e) {
        callback(new Error("A network error occurred"));
    };

    xhr.open("GET", url);
    xhr.send();
};


function CryptoProvider(){

    this.generateSafeUid = function(){
        let uid = "";
        var array = new Uint32Array(10);
        window.crypto.getRandomValues(array);


        for (var i = 0; i < array.length; i++) {
            uid += array[i].toString(16);
        }

        return uid;
    }

    this.signSwarm = function(swarm, agent){
        swarm.meta.signature = agent;
    }
}



$$.remote.cryptoProvider = new CryptoProvider();

$$.remote.base64Encode = function base64Encode(stringToEncode){
    return window.btoa(stringToEncode);
};

$$.remote.base64Decode = function base64Decode(encodedString){
    return window.atob(encodedString);
};

}).call(this,require("buffer").Buffer)

},{"buffer":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\lib\\psk-node-client.js":[function(require,module,exports){
(function (Buffer){
require("./psk-abstract-client");

const http = require("http");
const https = require("https");
const URL = require("url");
const userAgent = 'PSK NodeAgent/0.0.1';
const signatureHeaderName = process.env.vmq_signature_header_name || "x-signature";


console.log("PSK node client loading");

function getNetworkForOptions(options) {
	if(options.protocol === 'http:') {
		return http;
	} else if(options.protocol === 'https:') {
		return https;
	} else {
		throw new Error(`Can't handle protocol ${options.protocol}`);
	}

}

function generateMethodForRequestWithData(httpMethod) {
	return function (url, data, callback) {
		const innerUrl = URL.parse(url);

		const options = {
			hostname: innerUrl.hostname,
			path: innerUrl.pathname,
			port: parseInt(innerUrl.port),
			headers: {
				'User-Agent': userAgent,
				[signatureHeaderName]: 'replaceThisPlaceholderSignature'
			},
			method: httpMethod
		};

		const network = getNetworkForOptions(innerUrl);

		if (ArrayBuffer.isView(data) || Buffer.isBuffer(data) || data instanceof ArrayBuffer) {
			if (!Buffer.isBuffer(data)) {
				data = Buffer.from(data);
			}

			options.headers['Content-Type'] = 'application/octet-stream';
			options.headers['Content-Length'] = data.length;
		}

		const req = network.request(options, (res) => {
			const {statusCode} = res;

			let error;
			if (statusCode >= 400) {
				error = new Error('Request Failed.\n' +
					`Status Code: ${statusCode}\n` +
					`URL: ${options.hostname}:${options.port}${options.path}`);
			}

			if (error) {
				callback({error: error, statusCode: statusCode});
				// free up memory
				res.resume();
				return;
			}

			let rawData = '';
			res.on('data', (chunk) => {
				rawData += chunk;
			});
			res.on('end', () => {
				try {
					callback(null, rawData, res.headers);
				} catch (err) {
					return callback(err);
				}finally {
					//trying to prevent getting ECONNRESET error after getting our response
					req.abort();
				}
			});
		}).on("error", (error) => {
			console.log(`[POST] ${url}`, error);
			callback(error);
		});

		if (data && data.pipe && typeof data.pipe === "function") {
			data.pipe(req);
			return;
		}

		if (typeof data !== 'string' && !Buffer.isBuffer(data) && !ArrayBuffer.isView(data)) {
			data = JSON.stringify(data);
		}

		req.write(data);
		req.end();
	};
}

$$.remote.doHttpPost = generateMethodForRequestWithData('POST');

$$.remote.doHttpPut = generateMethodForRequestWithData('PUT');

$$.remote.doHttpGet = function doHttpGet(url, callback){
    const innerUrl = URL.parse(url);

	const options = {
		hostname: innerUrl.hostname,
		path: innerUrl.pathname + (innerUrl.search || ''),
		port: parseInt(innerUrl.port),
		headers: {
			'User-Agent': userAgent,
            [signatureHeaderName]: 'someSignature'
		},
		method: 'GET'
	};

	const network = getNetworkForOptions(innerUrl);
	const req = network.request(options, (res) => {
		const { statusCode } = res;

		let error;
		if (statusCode !== 200) {
			error = new Error('Request Failed.\n' +
				`Status Code: ${statusCode}`);
			error.code = statusCode;
		}

		if (error) {
			callback({error:error, statusCode:statusCode});
			// free up memory
			res.resume();
			return
		}

		let rawData;
		const contentType = res.headers['content-type'];

		if(contentType === "application/octet-stream"){
			rawData = [];
		}else{
			rawData = '';
		}

		res.on('data', (chunk) => {
			if(Array.isArray(rawData)){
				rawData.push(...chunk);
			}else{
				rawData += chunk;
			}
		});
		res.on('end', () => {
			try {
				if(Array.isArray(rawData)){
					rawData = Buffer.from(rawData);
				}
				callback(null, rawData, res.headers);
			} catch (err) {
				console.log("Client error:", err);
			}finally {
				//trying to prevent getting ECONNRESET error after getting our response
				req.abort();
			}
		});
	});

	req.on("error", (error) => {
		if(error && error.code !== 'ECONNRESET'){
        	console.log(`[GET] ${url}`, error);
		}

		callback(error);
	});

	req.end();
};

$$.remote.base64Encode = function base64Encode(stringToEncode){
    return Buffer.from(stringToEncode).toString('base64');
};

$$.remote.base64Decode = function base64Decode(encodedString){
    return Buffer.from(encodedString, 'base64').toString('ascii');
};

}).call(this,require("buffer").Buffer)

},{"./psk-abstract-client":"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\lib\\psk-abstract-client.js","buffer":false,"http":false,"https":false,"url":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\PskCrypto.js":[function(require,module,exports){
(function (Buffer){
function PskCrypto() {
    const crypto = require('crypto');
    const utils = require("./utils/cryptoUtils");
    const PskEncryption = require("./PskEncryption");
    const or = require('overwrite-require');

    this.createPskEncryption = (algorithm) => {
        return new PskEncryption(algorithm);
    };

    this.sign = function (privateKey, digest) {
        if (typeof digest === "string") {
            digest = Buffer.from(digest, "hex");
        }

        return crypto.createSign("sha256").update(digest).sign(privateKey);
    };

    this.verify = function (publicKey, signature, digest) {
        if (typeof digest === "string") {
            digest = Buffer.from(digest, "hex");
        }

        if (typeof signature === "string") {
            signature = Buffer.from(signature, "hex");
        }
        return crypto.createVerify("sha256").update(digest).verify(publicKey, signature);
    };

    this.generateKeyPair = (callback) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
            }
        }, callback);
    };

    this.privateEncrypt = (privateKey, data) => {
        if (typeof data === "string") {
            data = Buffer.from(data);
        }

        return crypto.privateEncrypt(privateKey, data);
    };

    this.privateDecrypt = (privateKey, encryptedData) => {
        if (typeof encryptedData === "string") {
            encryptedData = Buffer.from(encryptedData);
        }

        return crypto.privateDecrypt(privateKey, encryptedData);
    };

    this.publicEncrypt = (publicKey, data) => {
        if (typeof data === "string") {
            data = Buffer.from(data);
        }

        return crypto.publicEncrypt(publicKey, data);
    };

    this.publicDecrypt = (publicKey, encryptedData) => {
        if (typeof encryptedData === "string") {
            encryptedData = Buffer.from(encryptedData);
        }

        return crypto.publicDecrypt(publicKey, encryptedData);
    };

    this.pskHash = function (data, encoding) {
        if (Buffer.isBuffer(data)) {
            return utils.createPskHash(data, encoding);
        }
        if (data instanceof Object) {
            return utils.createPskHash(JSON.stringify(data), encoding);
        }
        return utils.createPskHash(data, encoding);
    };

    this.pskHashStream = function (readStream, callback) {
        const pskHash = new utils.PskHash();

        readStream.on('data', (chunk) => {
            pskHash.update(chunk);
        });


        readStream.on('end', () => {
            callback(null, pskHash.digest());
        })
    };

    this.generateSafeUid = function (password, additionalData) {
        password = password || Buffer.alloc(0);
        if (!additionalData) {
            additionalData = Buffer.alloc(0);
        }

        if (!Buffer.isBuffer(additionalData)) {
            additionalData = Buffer.from(additionalData);
        }

        return utils.encode(this.pskHash(Buffer.concat([password, additionalData])));
    };

    this.deriveKey = function deriveKey(algorithm, password) {
        const keylen = utils.getKeyLength(algorithm);
        const salt = utils.generateSalt(password, 32);
        return crypto.pbkdf2Sync(password, salt, 1000, keylen, 'sha256');
    };


    this.randomBytes = (len) => {
        if ($$.environmentType === or.constants.BROWSER_ENVIRONMENT_TYPE) {
            let randomArray = new Uint8Array(len);

            return window.crypto.getRandomValues(randomArray);
        } else {
            return crypto.randomBytes(len);
        }
    };

    this.xorBuffers = (...args) => {
        if (args.length < 2) {
            throw Error(`The function should receive at least two arguments. Received ${args.length}`);
        }

        if (args.length === 2) {
            __xorTwoBuffers(args[0], args[1]);
            return args[1];
        }

        for (let i = 0; i < args.length - 1; i++) {
            __xorTwoBuffers(args[i], args[i + 1]);
        }

        function __xorTwoBuffers(a, b) {
            if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
                throw Error("The argument type should be Buffer.");
            }

            const length = Math.min(a.length, b.length);
            for (let i = 0; i < length; i++) {
                b[i] ^= a[i];
            }

            return b;
        }

        return args[args.length - 1];
    };

    this.PskHash = utils.PskHash;
}

module.exports = new PskCrypto();



}).call(this,require("buffer").Buffer)

},{"./PskEncryption":"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\PskEncryption.js","./utils/cryptoUtils":"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\utils\\cryptoUtils.js","buffer":false,"crypto":false,"overwrite-require":"overwrite-require"}],"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\PskEncryption.js":[function(require,module,exports){
(function (Buffer){
const crypto = require("crypto");
const utils = require("./utils/cryptoUtils");

function PskEncryption(algorithm) {
    if (!algorithm) {
        throw Error("No encryption algorithm was provided");
    }

    let iv;
    let aad;
    let tag;
    let data;
    let key;

    let keylen = utils.getKeyLength(algorithm);
    let encryptionIsAuthenticated = utils.encryptionIsAuthenticated(algorithm);

    this.encrypt = (plainData, encryptionKey, options) => {
        iv = iv || crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, encryptionKey, iv, options);
        if (encryptionIsAuthenticated) {
            aad = crypto.randomBytes(encryptionKey.length);
            cipher.setAAD(aad);
        }

        const encData = Buffer.concat([cipher.update(plainData), cipher.final()]);
        if (encryptionIsAuthenticated) {
            tag = cipher.getAuthTag();
        }

        key = encryptionKey;
        return encData;
    };

    this.decrypt = (encryptedData, decryptionKey, authTagLength = 0, options) => {
        if (!iv) {
            this.getDecryptionParameters(encryptedData, authTagLength);
        }
        const decipher = crypto.createDecipheriv(algorithm, decryptionKey, iv, options);
        if (encryptionIsAuthenticated) {
            decipher.setAAD(aad);
            decipher.setAuthTag(tag);
        }

        return Buffer.concat([decipher.update(data), decipher.final()]);
    };

    this.getEncryptionParameters = () => {
        if (!iv) {
            return;
        }

        return {iv, aad, key, tag};
    };

    this.getDecryptionParameters = (encryptedData, authTagLength = 0) => {
        let aadLen = 0;
        if (encryptionIsAuthenticated) {
            authTagLength = 16;
            aadLen = keylen;
        }

        const tagOffset = encryptedData.length - authTagLength;
        tag = encryptedData.slice(tagOffset, encryptedData.length);

        const aadOffset = tagOffset - aadLen;
        aad = encryptedData.slice(aadOffset, tagOffset);

        iv = encryptedData.slice(aadOffset - 16, aadOffset);
        data = encryptedData.slice(0, aadOffset - 16);

        return {iv, aad, tag, data};
    };

    this.generateEncryptionKey = () => {
        keylen = utils.getKeyLength(algorithm);
        return crypto.randomBytes(keylen);
    };
}

module.exports = PskEncryption;
}).call(this,require("buffer").Buffer)

},{"./utils/cryptoUtils":"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\utils\\cryptoUtils.js","buffer":false,"crypto":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\utils\\DuplexStream.js":[function(require,module,exports){
const stream = require('stream');
const util = require('util');

const Duplex = stream.Duplex;

function DuplexStream(options) {
	if (!(this instanceof DuplexStream)) {
		return new DuplexStream(options);
	}
	Duplex.call(this, options);
}
util.inherits(DuplexStream, Duplex);

DuplexStream.prototype._write = function (chunk, enc, cb) {
	this.push(chunk);
	cb();
};


DuplexStream.prototype._read = function (n) {

};

module.exports = DuplexStream;
},{"stream":false,"util":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\utils\\cryptoUtils.js":[function(require,module,exports){
(function (Buffer){
const crypto = require('crypto');

const keySizes = [128, 192, 256];
const authenticationModes = ["ocb", "ccm", "gcm"];

function encode(buffer) {
	return buffer.toString('base64')
		.replace(/\+/g, '')
		.replace(/\//g, '')
		.replace(/=+$/, '');
}

function createPskHash(data, encoding) {
	const pskHash = new PskHash();
	pskHash.update(data);
	return pskHash.digest(encoding);
}

function PskHash() {
	const sha512 = crypto.createHash('sha512');
	const sha256 = crypto.createHash('sha256');

	function update(data) {
		sha512.update(data);
	}

	function digest(encoding) {
		sha256.update(sha512.digest());
		return sha256.digest(encoding);
	}

	return {
		update,
		digest
	}
}


function generateSalt(inputData, saltLen) {
	const hash = crypto.createHash('sha512');
	hash.update(inputData);
	const digest = Buffer.from(hash.digest('hex'), 'binary');

	return digest.slice(0, saltLen);
}

function encryptionIsAuthenticated(algorithm) {
	for (const mode of authenticationModes) {
		if (algorithm.includes(mode)) {
			return true;
		}
	}

	return false;
}

function getKeyLength(algorithm) {
	for (const len of keySizes) {
		if (algorithm.includes(len.toString())) {
			return len / 8;
		}
	}

	throw new Error("Invalid encryption algorithm.");
}

module.exports = {
	createPskHash,
	encode,
	generateSalt,
	PskHash,
	getKeyLength,
	encryptionIsAuthenticated
};


}).call(this,require("buffer").Buffer)

},{"buffer":false,"crypto":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\utils\\isStream.js":[function(require,module,exports){
const stream = require('stream');


function isStream (obj) {
	return obj instanceof stream.Stream || obj instanceof stream.Duplex;
}


function isReadable (obj) {
	return isStream(obj) && typeof obj._read === 'function' && typeof obj._readableState === 'object'
}


function isWritable (obj) {
	return isStream(obj) && typeof obj._write === 'function' && typeof obj._writableState === 'object'
}


function isDuplex (obj) {
	return isReadable(obj) && isWritable(obj)
}


module.exports            = isStream;
module.exports.isReadable = isReadable;
module.exports.isWritable = isWritable;
module.exports.isDuplex   = isDuplex;
},{"stream":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\signsensusDS\\ssutil.js":[function(require,module,exports){
/*
 SignSens helper functions
 */
const crypto = require('crypto');

exports.wipeOutsidePayload = function wipeOutsidePayload(hashStringHexa, pos, size){
    var result;
    var sz = hashStringHexa.length;

    var end = (pos + size) % sz;

    if(pos < end){
        result = '0'.repeat(pos) +  hashStringHexa.substring(pos, end) + '0'.repeat(sz - end);
    }
    else {
        result = hashStringHexa.substring(0, end) + '0'.repeat(pos - end) + hashStringHexa.substring(pos, sz);
    }
    return result;
}



exports.extractPayload = function extractPayload(hashStringHexa, pos, size){
    var result;

    var sz = hashStringHexa.length;
    var end = (pos + size) % sz;

    if( pos < end){
        result = hashStringHexa.substring(pos, pos + size);
    } else{

        if(0 != end){
            result = hashStringHexa.substring(0, end)
        }  else {
            result = "";
        }
        result += hashStringHexa.substring(pos, sz);
    }
    return result;
}



exports.fillPayload = function fillPayload(payload, pos, size){
    var sz = 64;
    var result = "";

    var end = (pos + size) % sz;

    if( pos < end){
        result = '0'.repeat(pos) + payload + '0'.repeat(sz - end);
    } else{
        result = payload.substring(0,end);
        result += '0'.repeat(pos - end);
        result += payload.substring(end);
    }
    return result;
}



exports.generatePosHashXTimes = function generatePosHashXTimes(buffer, pos, size, count){ //generate positional hash
    var result  = buffer.toString("hex");

    /*if(pos != -1 )
        result[pos] = 0; */

    for(var i = 0; i < count; i++){
        var hash = crypto.createHash('sha256');
        result = exports.wipeOutsidePayload(result, pos, size);
        hash.update(result);
        result = hash.digest('hex');
    }
    return exports.wipeOutsidePayload(result, pos, size);
}

exports.hashStringArray = function (counter, arr, payloadSize){

    const hash = crypto.createHash('sha256');
    var result = counter.toString(16);

    for(var i = 0 ; i < 64; i++){
        result += exports.extractPayload(arr[i],i, payloadSize);
    }

    hash.update(result);
    var result = hash.digest('hex');
    return result;
}






function dumpMember(obj){
    var type = Array.isArray(obj) ? "array" : typeof obj;
    if(obj === null){
        return "null";
    }
    if(obj === undefined){
        return "undefined";
    }

    switch(type){
        case "number":
        case "string":return obj.toString(); break;
        case "object": return exports.dumpObjectForHashing(obj); break;
        case "boolean": return  obj? "true": "false"; break;
        case "array":
            var result = "";
            for(var i=0; i < obj.length; i++){
                result += exports.dumpObjectForHashing(obj[i]);
            }
            return result;
            break;
        default:
            throw new Error("Type " +  type + " cannot be cryptographically digested");
    }

}


exports.dumpObjectForHashing = function(obj){
    var result = "";

    if(obj === null){
        return "null";
    }
    if(obj === undefined){
        return "undefined";
    }

    var basicTypes = {
        "array"     : true,
        "number"    : true,
        "boolean"   : true,
        "string"    : true,
        "object"    : false
    }

    var type = Array.isArray(obj) ? "array" : typeof obj;
    if( basicTypes[type]){
        return dumpMember(obj);
    }

    var keys = Object.keys(obj);
    keys.sort();


    for(var i=0; i < keys.length; i++){
        result += dumpMember(keys[i]);
        result += dumpMember(obj[keys[i]]);
    }

    return result;
}


exports.hashValues  = function (values){
    const hash = crypto.createHash('sha256');
    var result = exports.dumpObjectForHashing(values);
    hash.update(result);
    return hash.digest('hex');
};

exports.getJSONFromSignature = function getJSONFromSignature(signature, size){
    var result = {
        proof:[]
    };
    var a = signature.split(":");
    result.agent        = a[0];
    result.counter      =  parseInt(a[1], "hex");
    result.nextPublic   =  a[2];

    var proof = a[3]


    if(proof.length/size != 64) {
        throw new Error("Invalid signature " + proof);
    }

    for(var i = 0; i < 64; i++){
        result.proof.push(exports.fillPayload(proof.substring(i * size,(i+1) * size ), i, size))
    }

    return result;
}

exports.createSignature = function (agent,counter, nextPublic, arr, size){
    var result = "";

    for(var i = 0; i < arr.length; i++){
        result += exports.extractPayload(arr[i], i , size);
    }

    return agent + ":" + counter + ":" + nextPublic + ":" + result;
}
},{"crypto":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\soundpubsub\\lib\\soundPubSub.js":[function(require,module,exports){
/*
Initial License: (c) Axiologic Research & Alboaie Sînică.
Contributors: Axiologic Research , PrivateSky project
Code License: LGPL or MIT.
*/


/**
 *   Usually an event could cause execution of other callback events . We say that is a level 1 event if is causeed by a level 0 event and so on
 *
 *      SoundPubSub provides intuitive results regarding to asynchronous calls of callbacks and computed values/expressions:
 *   we prevent immediate execution of event callbacks to ensure the intuitive final result is guaranteed as level 0 execution
 *   we guarantee that any callback function is "re-entrant"
 *   we are also trying to reduce the number of callback execution by looking in queues at new messages published by
 *   trying to compact those messages (removing duplicate messages, modifying messages, or adding in the history of another event ,etc)
 *
 *      Example of what can be wrong without non-sound asynchronous calls:
 *
 *  Step 0: Initial state:
 *   a = 0;
 *   b = 0;
 *
 *  Step 1: Initial operations:
 *   a = 1;
 *   b = -1;
 *
 *  // an observer reacts to changes in a and b and compute CORRECT like this:
 *   if( a + b == 0) {
 *       CORRECT = false;
 *       notify(...); // act or send a notification somewhere..
 *   } else {
 *      CORRECT = false;
 *   }
 *
 *    Notice that: CORRECT will be true in the end , but meantime, after a notification was sent and CORRECT was wrongly, temporarily false!
 *    soundPubSub guarantee that this does not happen because the syncronous call will before any observer (bot asignation on a and b)
 *
 *   More:
 *   you can use blockCallBacks and releaseCallBacks in a function that change a lot a collection or bindable objects and all
 *   the notifications will be sent compacted and properly
 */

// TODO: optimisation!? use a more efficient queue instead of arrays with push and shift!?
// TODO: see how big those queues can be in real applications
// for a few hundreds items, queues made from array should be enough
//*   Potential TODOs:
//    *     prevent any form of problem by calling callbacks in the expected order !?
//*     preventing infinite loops execution cause by events!?
//*
//*
// TODO: detect infinite loops (or very deep propagation) It is possible!?

const Queue = require('swarmutils').Queue;

function SoundPubSub(){

	/**
	 * publish
	 *      Publish a message {Object} to a list of subscribers on a specific topic
	 *
	 * @params {String|Number} target,  {Object} message
	 * @return number of channel subscribers that will be notified
	 */
	this.publish = function(target, message){
		if(!invalidChannelName(target) && !invalidMessageType(message) && (typeof channelSubscribers[target] != 'undefined')){
			compactAndStore(target, message);
			setTimeout(dispatchNext, 0);
			return channelSubscribers[target].length;
		} else{
			return null;
		}
	};

	/**
	 * subscribe
	 *      Subscribe / add a {Function} callBack on a {String|Number}target channel subscribers list in order to receive
	 *      messages published if the conditions defined by {Function}waitForMore and {Function}filter are passed.
	 *
	 * @params {String|Number}target, {Function}callBack, {Function}waitForMore, {Function}filter
	 *
	 *          target      - channel name to subscribe
	 *          callback    - function to be called when a message was published on the channel
	 *          waitForMore - a intermediary function that will be called after a successfuly message delivery in order
	 *                          to decide if a new messages is expected...
	 *          filter      - a function that receives the message before invocation of callback function in order to allow
	 *                          relevant message before entering in normal callback flow
	 * @return
	 */
	this.subscribe = function(target, callBack, waitForMore, filter){
		if(!invalidChannelName(target) && !invalidFunction(callBack)){
			var subscriber = {"callBack":callBack, "waitForMore":waitForMore, "filter":filter};
			var arr = channelSubscribers[target];
			if(typeof arr == 'undefined'){
				arr = [];
				channelSubscribers[target] = arr;
			}
			arr.push(subscriber);
		}
	};

	/**
	 * unsubscribe
	 *      Unsubscribe/remove {Function} callBack from the list of subscribers of the {String|Number} target channel
	 *
	 * @params {String|Number} target, {Function} callBack, {Function} filter
	 *
	 *          target      - channel name to unsubscribe
	 *          callback    - reference of the original function that was used as subscribe
	 *          filter      - reference of the original filter function
	 * @return
	 */
	this.unsubscribe = function(target, callBack, filter){
		if(!invalidFunction(callBack)){
			var gotit = false;
			if(channelSubscribers[target]){
				for(var i = 0; i < channelSubscribers[target].length;i++){
					var subscriber =  channelSubscribers[target][i];
					if(subscriber.callBack === callBack && ( typeof filter === 'undefined' || subscriber.filter === filter )){
						gotit = true;
						subscriber.forDelete = true;
						subscriber.callBack = undefined;
						subscriber.filter = undefined;
					}
				}
			}
			if(!gotit){
				wprint("Unable to unsubscribe a callback that was not subscribed!");
			}
		}
	};

	/**
	 * blockCallBacks
	 *
	 * @params
	 * @return
	 */
	this.blockCallBacks = function(){
		level++;
	};

	/**
	 * releaseCallBacks
	 *
	 * @params
	 * @return
	 */
	this.releaseCallBacks = function(){
		level--;
		//hack/optimisation to not fill the stack in extreme cases (many events caused by loops in collections,etc)
		while(level === 0 && dispatchNext(true)){
			//nothing
		}

		while(level === 0 && callAfterAllEvents()){
            //nothing
		}
	};

	/**
	 * afterAllEvents
	 *
	 * @params {Function} callback
	 *
	 *          callback - function that needs to be invoked once all events are delivered
	 * @return
	 */
	this.afterAllEvents = function(callBack){
		if(!invalidFunction(callBack)){
			afterEventsCalls.push(callBack);
		}
		this.blockCallBacks();
		this.releaseCallBacks();
	};

	/**
	 * hasChannel
	 *
	 * @params {String|Number} channel
	 *
	 *          channel - name of the channel that need to be tested if present
	 * @return
	 */
	this.hasChannel = function(channel){
		return !invalidChannelName(channel) && (typeof channelSubscribers[channel] != 'undefined') ? true : false;
	};

	/**
	 * addChannel
	 *
	 * @params {String} channel
	 *
	 *          channel - name of a channel that needs to be created and added to soundpubsub repository
	 * @return
	 */
	this.addChannel = function(channel){
		if(!invalidChannelName(channel) && !this.hasChannel(channel)){
			channelSubscribers[channel] = [];
		}
	};

	/* ---------------------------------------- protected stuff ---------------------------------------- */
	var self = this;
	// map channelName (object local id) -> array with subscribers
	var channelSubscribers = {};

	// map channelName (object local id) -> queue with waiting messages
	var channelsStorage = {};

	// object
	var typeCompactor = {};

	// channel names
	var executionQueue = new Queue();
	var level = 0;



	/**
	 * registerCompactor
	 *
	 *       An compactor takes a newEvent and and oldEvent and return the one that survives (oldEvent if
	 *  it can compact the new one or the newEvent if can't be compacted)
	 *
	 * @params {String} type, {Function} callBack
	 *
	 *          type        - channel name to unsubscribe
	 *          callBack    - handler function for that specific event type
	 * @return
	 */
	this.registerCompactor = function(type, callBack) {
		if(!invalidFunction(callBack)){
			typeCompactor[type] = callBack;
		}
	};

	/**
	 * dispatchNext
	 *
	 * @param fromReleaseCallBacks: hack to prevent too many recursive calls on releaseCallBacks
	 * @return {Boolean}
	 */
	function dispatchNext(fromReleaseCallBacks){
		if(level > 0) {
			return false;
		}
		const channelName = executionQueue.front();
		if(typeof channelName != 'undefined'){
			self.blockCallBacks();
			try{
				let message;
				if(!channelsStorage[channelName].isEmpty()) {
					message = channelsStorage[channelName].front();
				}
				if(typeof message == 'undefined'){
					if(!channelsStorage[channelName].isEmpty()){
						wprint("Can't use as message in a pub/sub channel this object: " + message);
					}
					executionQueue.pop();
				} else {
					if(typeof message.__transmisionIndex == 'undefined'){
						message.__transmisionIndex = 0;
						for(var i = channelSubscribers[channelName].length-1; i >= 0 ; i--){
							var subscriber =  channelSubscribers[channelName][i];
							if(subscriber.forDelete === true){
								channelSubscribers[channelName].splice(i,1);
							}
						}
					} else{
						message.__transmisionIndex++;
					}
					//TODO: for immutable objects it will not work also, fix for shape models
					if(typeof message.__transmisionIndex == 'undefined'){
						wprint("Can't use as message in a pub/sub channel this object: " + message);
					}
					subscriber = channelSubscribers[channelName][message.__transmisionIndex];
					if(typeof subscriber == 'undefined'){
						delete message.__transmisionIndex;
						channelsStorage[channelName].pop();
					} else{
						if(subscriber.filter === null || typeof subscriber.filter === "undefined" || (!invalidFunction(subscriber.filter) && subscriber.filter(message))){
							if(!subscriber.forDelete){
								subscriber.callBack(message);
								if(subscriber.waitForMore && !invalidFunction(subscriber.waitForMore) && !subscriber.waitForMore(message)){
									subscriber.forDelete = true;
								}
							}
						}
					}
				}
			} catch(err){
				wprint("Event callback failed: "+ subscriber.callBack +"error: " + err.stack);
			}
			//
			if(fromReleaseCallBacks){
				level--;
			} else{
				self.releaseCallBacks();
			}
			return true;
		} else{
			return false;
		}
	}

	function compactAndStore(target, message){
		var gotCompacted = false;
		var arr = channelsStorage[target];
		if(typeof arr == 'undefined'){
			arr = new Queue();
			channelsStorage[target] = arr;
		}

		if(message && typeof message.type != 'undefined'){
			var typeCompactorCallBack = typeCompactor[message.type];

			if(typeof typeCompactorCallBack != 'undefined'){
				for(let channel of arr) {
					if(typeCompactorCallBack(message, channel) === channel) {
						if(typeof channel.__transmisionIndex == 'undefined') {
							gotCompacted = true;
							break;
						}
					}
				}
			}
		}

		if(!gotCompacted && message){
			arr.push(message);
			executionQueue.push(target);
		}
	}

	var afterEventsCalls = new Queue();
	function callAfterAllEvents (){
		if(!afterEventsCalls.isEmpty()){
			var callBack = afterEventsCalls.pop();
			//do not catch exceptions here..
			callBack();
		}
		return !afterEventsCalls.isEmpty();
	}

	function invalidChannelName(name){
		var result = false;
		if(!name || (typeof name != "string" && typeof name != "number")){
			result = true;
			wprint("Invalid channel name: " + name);
		}

		return result;
	}

	function invalidMessageType(message){
		var result = false;
		if(!message || typeof message != "object"){
			result = true;
			wprint("Invalid messages types: " + message);
		}
		return result;
	}

	function invalidFunction(callback){
		var result = false;
		if(!callback || typeof callback != "function"){
			result = true;
			wprint("Expected to be function but is: " + callback);
		}
		return result;
	}
}

exports.soundPubSub = new SoundPubSub();
},{"swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\SwarmEngine.js":[function(require,module,exports){
function SwarmEngine(identity) {
    let myOwnIdentity = identity || SwarmEngine.prototype.ANONYMOUS_IDENTITY;

    const protectedFunctions = {};

    const SwarmPacker = require("swarmutils").SwarmPacker;
    //serializationType used when starting a swarm from this SwarmEngine instance
    let serializationType = SwarmPacker.prototype.JSON;

    const swarmInstancesCache = new Map();
    const powerCordCollection = new Map();

    this.updateIdentity = function (identify) {
        if (myOwnIdentity === SwarmEngine.prototype.ANONYMOUS_IDENTITY) {
            console.log("Updating my identity with", identify);
            myOwnIdentity = identify;
        } else {
            $$.err(`Trying to changing identity from "${myOwnIdentity}" to "${identify}"`);
        }
    };

    this.setSerializationType = function (type) {
        if (typeof SwarmPacker.getSerializer(type) !== "undefined") {
            serializationType = type;
        } else {
            $$.throw(`Unknown serialization type "${type}"`);
        }
    };

    this.plug = function (identity, powerCordImpl) {
        makePluggable(powerCordImpl);
        powerCordImpl.plug(identity, relay);

        powerCordCollection.set(identity, powerCordImpl);
    };

    this.unplug = function (identity) {
        const powerCord = powerCordCollection.get(identity);

        if (!powerCord) {
            //silent fail
            return;
        }

        powerCord.unplug();
        powerCordCollection.delete(identity);
    };

    function relay(swarmSerialization, ignoreMyIdentity) {
        try {

            const swarmutils = require('swarmutils');

            const OwM = swarmutils.OwM;
            const SwarmPacker = swarmutils.SwarmPacker;

            const swarmHeader = SwarmPacker.getHeader(swarmSerialization);
            const swarmTargetIdentity = swarmHeader.swarmTarget;

            if(typeof ignoreMyIdentity === "undefined" || !ignoreMyIdentity){
                if (myOwnIdentity === swarmTargetIdentity || myOwnIdentity === "*") {
                    const deserializedSwarm = OwM.prototype.convert(SwarmPacker.unpack(swarmSerialization));
                    protectedFunctions.execute_swarm(deserializedSwarm);
                    return;
                }
            }

            const targetPowerCord = powerCordCollection.get(swarmTargetIdentity) || powerCordCollection.get(SwarmEngine.prototype.WILD_CARD_IDENTITY);

            if (targetPowerCord) {
                //console.log(myOwnIdentity, "calling powercord", swarmTargetIdentity);
                targetPowerCord.sendSwarm(swarmSerialization);
                return;
            } else {
                $$.err(`Bad Swarm Engine configuration. No PowerCord for identity "${swarmTargetIdentity}" found.`);
            }
        } catch (superError) {
            console.log(superError);
        }
    }

    function getPowerCord(identity) {
        const powerCord = powerCordCollection.get(identity);

        if (!powerCord) {
            //should improve the search of powerCord based on * and self :D

            $$.throw(`No powerCord found for the identity "${identity}"`);
        }

        return powerCord;
    }

    /* ???
    swarmCommunicationStrategy.enableSwarmExecution(function(swarm){

    }); */

    function serialize(swarm) {
        const beesHealer = require("swarmutils").beesHealer;
        const simpleJson = beesHealer.asJSON(swarm, swarm.meta.phaseName, swarm.meta.args);
        const serializer = SwarmPacker.getSerializer(swarm.meta.serializationType || serializationType);
        return SwarmPacker.pack(simpleJson, serializer);
    }

    function createBaseSwarm(swarmTypeName) {
        const swarmutils = require('swarmutils');
        const OwM = swarmutils.OwM;

        const swarm = new OwM();
        swarm.setMeta("swarmId", $$.uidGenerator.safe_uuid());
        swarm.setMeta("requestId", swarm.getMeta("swarmId"));
        swarm.setMeta("swarmTypeName", swarmTypeName);
        swarm.setMeta(SwarmEngine.META_SECURITY_HOME_CONTEXT, myOwnIdentity);

        return swarm;
    }

    function cleanSwarmWaiter(swarmSerialisation) { // TODO: add better mechanisms to prevent memory leaks
        let swarmId = swarmSerialisation.meta.swarmId;
        let watcher = swarmInstancesCache[swarmId];

        if (!watcher) {
            $$.warn("Invalid swarm received: " + swarmId);
            return;
        }

        let args = swarmSerialisation.meta.args;
        args.push(swarmSerialisation);

        watcher.callback.apply(null, args);
        if (!watcher.keepAliveCheck()) {
            delete swarmInstancesCache[swarmId];
        }
    }

    protectedFunctions.startSwarmAs = function (identity, swarmTypeName, phaseName, ...args) {
        const swarm = createBaseSwarm(swarmTypeName);
        swarm.setMeta($$.swarmEngine.META_SECURITY_HOME_CONTEXT, myOwnIdentity);

        protectedFunctions.sendSwarm(swarm, SwarmEngine.EXECUTE_PHASE_COMMAND, identity, phaseName, args);
        return swarm;
    };

    protectedFunctions.sendSwarm = function (swarmAsVO, command, identity, phaseName, args) {

        swarmAsVO.setMeta("phaseName", phaseName);
        swarmAsVO.setMeta("target", identity);
        swarmAsVO.setMeta("command", command);
        swarmAsVO.setMeta("args", args);

        relay(serialize(swarmAsVO), true);
    };

    protectedFunctions.waitForSwarm = function (callback, swarm, keepAliveCheck) {

        function doLogic() {
            let swarmId = swarm.getInnerValue().meta.swarmId;
            let watcher = swarmInstancesCache.get(swarmId);
            if (!watcher) {
                watcher = {
                    swarm: swarm,
                    callback: callback,
                    keepAliveCheck: keepAliveCheck
                };
                swarmInstancesCache.set(swarmId, watcher);
            }
        }

        function filter() {
            return swarm.getInnerValue().meta.swarmId;
        }

        //$$.uidGenerator.wait_for_condition(condition,doLogic);
        swarm.observe(doLogic, null, filter);
    };

    protectedFunctions.execute_swarm = function (swarmOwM) {

        const swarmCommand = swarmOwM.getMeta('command');

        //console.log("Switching on command ", swarmCommand);
        switch (swarmCommand) {
            case SwarmEngine.prototype.EXECUTE_PHASE_COMMAND:
                let swarmId = swarmOwM.getMeta('swarmId');
                let swarmType = swarmOwM.getMeta('swarmTypeName');
                let instance = swarmInstancesCache.get(swarmId);

                let swarm;

                if (instance) {
                    swarm = instance.swarm;
                    swarm.actualize(swarmOwM);

                } else {
                    if (typeof $$.blockchain !== "undefined") {
                        swarm = $$.swarm.startWithContext($$.blockchain, swarmType);
                    } else {
                        swarm = $$.swarm.start(swarmType);
                    }

                    if (!swarm) {
                        throw new Error(`Unknown swarm with type <${swarmType}>. Check if this swarm is defined in the domain constitution!`);
                    } else {
                        swarm.actualize(swarmOwM);
                    }

                    /*swarm = $$.swarm.start(swarmType, swarmSerialisation);*/
                }
                swarm.runPhase(swarmOwM.meta.phaseName, swarmOwM.meta.args);
                break;
            case SwarmEngine.prototype.EXECUTE_INTERACT_PHASE_COMMAND:
                is.dispatch(swarmOwM);
                break;
            case SwarmEngine.prototype.RETURN_PHASE_COMMAND:
                is.dispatch(swarmOwM);
                break;
            default:
                $$.err(`Unrecognized swarm command ${swarmCommand}`);
        }
    };

    protectedFunctions.acknowledge = function(method, swarmId, swarmName, swarmPhase, cb){
        powerCordCollection.forEach((powerCord, identity)=>{
            if(typeof powerCord[method] === "function"){
                powerCord[method].call(powerCord, swarmId, swarmName, swarmPhase, cb);
            }
        });
    };

    require("./swarms")(protectedFunctions);
    const is = require("./interactions")(protectedFunctions);
}

Object.defineProperty(SwarmEngine.prototype, "EXECUTE_PHASE_COMMAND", {value: "executeSwarmPhase"});
Object.defineProperty(SwarmEngine.prototype, "EXECUTE_INTERACT_PHASE_COMMAND", {value: "executeInteractPhase"});
Object.defineProperty(SwarmEngine.prototype, "RETURN_PHASE_COMMAND", {value: "__return__"});

Object.defineProperty(SwarmEngine.prototype, "META_RETURN_CONTEXT", {value: "returnContext"});
Object.defineProperty(SwarmEngine.prototype, "META_SECURITY_HOME_CONTEXT", {value: "homeSecurityContext"});
Object.defineProperty(SwarmEngine.prototype, "META_WAITSTACK", {value: "waitStack"});

Object.defineProperty(SwarmEngine.prototype, "ANONYMOUS_IDENTITY", {value: "anonymous"});
Object.defineProperty(SwarmEngine.prototype, "SELF_IDENTITY", {value: "self"});
Object.defineProperty(SwarmEngine.prototype, "WILD_CARD_IDENTITY", {value: "*"});

function makePluggable(powerCord) {
    powerCord.plug = function (identity, powerTransfer) {
        powerCord.transfer = powerTransfer;
        powerCord.identity = identity;
    };

    powerCord.unplug = function () {
        powerCord.transfer = null;
    };

    Object.defineProperty(powerCord, "identity", {
        set: (value) => {
            if(typeof powerCord.__identity === "undefined"){
                powerCord.__identity = value;
            }
        }, get: () => {
            return powerCord.__identity;
        }
    });

    return powerCord;
}

module.exports = SwarmEngine;
},{"./interactions":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\interactions\\index.js","./swarms":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\swarms\\index.js","swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\BootEngine.js":[function(require,module,exports){
function BootEngine(getSeed, getEDFS, initializeSwarmEngine, runtimeBundles, constitutionBundles) {

    if(typeof getSeed !== "function"){
        throw new Error("getSeed missing or not a function");
    }
    getSeed = promisify(getSeed);

    if(typeof getEDFS !== "function"){
        throw new Error("getEDFS missing or not a function");
    }
    getEDFS = promisify(getEDFS);

    if(typeof initializeSwarmEngine !== "function"){
        throw new Error("initializeSwarmEngine missing or not a function");
    }
    initializeSwarmEngine = promisify(initializeSwarmEngine);

    if(typeof runtimeBundles !== "undefined" && !Array.isArray(runtimeBundles)){
        throw new Error("runtimeBundles is not array");
    }

    if(typeof constitutionBundles !== "undefined" && !Array.isArray(constitutionBundles)){
        throw new Error("constitutionBundles is not array");
    }

    const EDFS = require('edfs');
    let edfs;

    const evalBundles = async (bundles, ignore) => {
        const listFiles = promisify(this.bar.listFiles);
        const readFile = promisify(this.bar.readFile);

        let fileList = await listFiles(EDFS.constants.CSB.CONSTITUTION_FOLDER);
        fileList = bundles.filter(bundle => fileList.includes(`${EDFS.constants.CSB.CONSTITUTION_FOLDER}/${bundle}`))
            .map(bundle => `${EDFS.constants.CSB.CONSTITUTION_FOLDER}/${bundle}`);

        if (fileList.length !== bundles.length) {
            const message = `Some bundles missing. Expected to have ${JSON.stringify(bundles)} but got only ${JSON.stringify(fileList)}`;
            if(!ignore){
                throw new Error(message);
            }else{
                console.log(message);
            }
        }

        for (let i = 0; i < fileList.length; i++) {
            var fileContent = await readFile(fileList[i]);
            eval(fileContent.toString());
        }
    };

    this.boot = function (callback) {
       const __boot = async () => {
           const seed = await getSeed();
           edfs = await getEDFS();
           this.bar = edfs.loadBar(seed);
           await evalBundles(runtimeBundles);
           await initializeSwarmEngine();
           if (typeof constitutionBundles !== "undefined") {
               await evalBundles(constitutionBundles, true);
           }
        };

        __boot()
            .then(() => callback(undefined, this.bar))
            .catch(callback);
    };
}

function promisify(fn) {
    return function (...args) {
        return new Promise((resolve, reject) => {
            fn(...args, (err, ...res) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(...res);
                }
            });
        });
    }
}

module.exports = BootEngine;

},{"edfs":"edfs"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\IsolateBootScript.js":[function(require,module,exports){

async function getIsolatesWorker({workerData: {constitutions}, externalApi}) {
    const swarmUtils = require('swarmutils');
    const beesHealer = swarmUtils.beesHealer;
    const OwM = swarmUtils.OwM;
    const SwarmPacker = swarmUtils.SwarmPacker;
    const IsolatedVM = require('pskisolates');
    const {EventEmitter} = require('events');

    const config = IsolatedVM.IsolateConfig.defaultConfig;
    config.logger = {
        send([logChannel, logObject]) {
            $$.redirectLog(logChannel, logObject)
        }
    };

    const fs = require('fs');

    constitutions = constitutions.map(constitution => fs.readFileSync(constitution, 'utf8'));

    const isolate = await IsolatedVM.getDefaultIsolate({
        shimsBundle: constitutions[0],
        browserifyBundles: constitutions.slice(1),
        config: config,
        externalApi: externalApi
    });

    class IsolatesWrapper extends EventEmitter {
        postMessage(packedSwarm) {
            const swarm = SwarmPacker.unpack(packedSwarm);

            const phaseName = OwM.prototype.getMetaFrom(swarm, 'phaseName');
            const args = OwM.prototype.getMetaFrom(swarm, 'args');
            const serializedSwarm = beesHealer.asJSON(swarm, phaseName, args);
            const stringifiedSwarm = JSON.stringify(serializedSwarm);

            isolate.run(`
                if(typeof global.identitySet === "undefined"){
                    global.identitySet = true;
                  
				    $$.swarmEngine.updateIdentity(getIdentity.applySync(undefined, []));
				}
            `).then(() => {
                const powerCordRef = isolate.context.global.getSync('powerCord');
                const transferFnRef = powerCordRef.getSync('transfer');
                const swarmAsRef = new isolate.ivm.ExternalCopy(new Uint8Array(packedSwarm)).copyInto();
                // console.log(transferFnRef, swarmAsRef);

                transferFnRef.applyIgnored(powerCordRef.derefInto(), [swarmAsRef]);
            }).catch((err) => {
                this.emit('error', err);
            });

        }
    }

    const isolatesWrapper = new IsolatesWrapper();
    isolatesWrapper.globalSetSync = isolate.globalSetSync;

    isolate.globalSetSync('returnSwarm', (err, swarm) => {
        try {
            isolatesWrapper.emit('message', swarm);
        } catch (e) {
            console.log('Caught error', e);
        }
    });

    await isolate.run(`
            const se = require("swarm-engine");
            global.powerCord = new se.InnerIsolatePowerCord();
            $$.swarmEngine.plug($$.swarmEngine.WILD_CARD_IDENTITY, global.powerCord);
		`);

    //TODO: this might cause a memory leak
    setInterval(async () => {
        const rawIsolate = isolate.rawIsolate;
        const cpuTime = rawIsolate.cpuTime;
        const wallTime = rawIsolate.wallTime;

        const heapStatistics = await rawIsolate.getHeapStatistics();
        const activeCPUTime = (cpuTime[0] + cpuTime[1] / 1e9) * 1000;
        const totalCPUTime = (wallTime[0] + wallTime[1] / 1e9) * 1000;
        const idleCPUTime = totalCPUTime - activeCPUTime;
        $$.event('sandbox.metrics', {heapStatistics, activeCPUTime, totalCPUTime, idleCPUTime});

    }, 10 * 1000); // 10 seconds


    return isolatesWrapper;
}

module.exports = getIsolatesWorker;

},{"events":false,"fs":false,"pskisolates":false,"swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\ThreadWorkerBootScript.js":[function(require,module,exports){
function boot() {
    const worker_threads ='worker_threads';
    const {parentPort, workerData} = require(worker_threads);

    process.on("uncaughtException", (err) => {
        console.error('unchaughtException inside worker', err);
        setTimeout(() => {
            process.exit(1);
        }, 100);
    });

    function getSeed(callback){
        let err;
        if (!workerData.hasOwnProperty('constitutionSeed') || typeof workerData.constitutionSeed !== "string") {
            err = new Error(`Missing or wrong type of constitutionSeed in worker data configuration: ${JSON.stringify(workerData)}`);
            if(!callback){
                throw err;
            }
        }
        if(callback){
            return callback(err, workerData.constitutionSeed);
        }
        return workerData.constitutionSeed;
    }

    let edfs;
    function getEDFS(callback){
        const EDFS = require("edfs");
        edfs = EDFS.attachWithSeed(getSeed());
        callback(null, edfs);
    }

    function initializeSwarmEngine(callback){
        require('callflow').initialise();
        const swarmEngine = require('swarm-engine');

        swarmEngine.initialise(process.env.IDENTITY);
        const powerCord = new swarmEngine.InnerThreadPowerCord();

        $$.swarmEngine.plug($$.swarmEngine.WILD_CARD_IDENTITY, powerCord);

        parentPort.on('message', (packedSwarm) => {
            powerCord.transfer(packedSwarm);
        });

        edfs.bootCSB(workerData.constitutionSeed, (err, csbhandler) =>{
            if(err){
                $$.throwError(err);
            }
            callback();
        });
    }

    const BootEngine = require("./BootEngine.js");

    const booter = new BootEngine(getSeed, getEDFS, initializeSwarmEngine, ["pskruntime.js", "blockchain.js"], ["domain.js"]);

    booter.boot((err) => {
        if(err){
            throw err;
        }
        parentPort.postMessage('ready');
    });
}

boot();
//module.exports = boot.toString();

},{"./BootEngine.js":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\BootEngine.js","callflow":false,"edfs":"edfs","swarm-engine":"swarm-engine"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\domainBootScript.js":[function(require,module,exports){
const path = require('path');
//enabling life line to parent process
require(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, "psknode/core/utils/pingpongFork.js")).enableLifeLine();

const seed = process.env.PSK_DOMAIN_SEED;
//preventing children to access the env parameter
process.env.PSK_DOMAIN_SEED = undefined;

if(process.argv.length > 3){
    process.env.PRIVATESKY_DOMAIN_NAME = process.argv[2];
}else{
    process.env.PRIVATESKY_DOMAIN_NAME = "AnonymousDomain" + process.pid;
}

process.env.PRIVATESKY_TMP = path.resolve(process.env.PRIVATESKY_TMP || "../tmp");
process.env.DOMAIN_WORKSPACE = path.resolve(process.env.PRIVATESKY_TMP, "domainsWorkspace", process.env.PRIVATESKY_DOMAIN_NAME);

const config = JSON.parse(process.env.config);

if (typeof config.constitution !== "undefined" && config.constitution !== "undefined") {
    process.env.PRIVATESKY_DOMAIN_CONSTITUTION = config.constitution;
}

if (typeof config.workspace !== "undefined" && config.workspace !== "undefined") {
    process.env.DOMAIN_WORKSPACE = config.workspace;
}

function boot(){
    const BootEngine = require("./BootEngine");

    const bootter = new BootEngine(getSeed, getEDFS, initializeSwarmEngine, ["pskruntime.js", "virtualMQ.js", "edfsBar.js"], ["blockchain.js"]);
    bootter.boot(function(err, archive){
        if(err){
            console.log(err);
            return;
        }
        try{
            plugPowerCords();
        }catch(err){
            console.log("Caught an error will finishing booting process", err);
        }
    })
}

function getSeed(callback){
    callback(undefined, self.seed);
}

let self = {seed};
function getEDFS(callback){
    let EDFS = require("edfs");
    self.edfs = EDFS.attachWithSeed(seed);
    callback(undefined, self.edfs);
}

function initializeSwarmEngine(callback){
    const EDFS = require("edfs");
    const bar = self.edfs.loadBar(self.seed);
    bar.readFile(EDFS.constants.CSB.DOMAIN_IDENTITY_FILE, (err, content)=>{
        if(err){
            return callback(err);
        }
        self.domainName = content.toString();
        $$.log(`Domain ${self.domainName} is booting...`);

        $$.PSK_PubSub = require("soundpubsub").soundPubSub;
        const se = require("swarm-engine");
        se.initialise(self.domainName);

        callback();
    });
}

function plugPowerCords(){
    const dossier = require("dossier");
    dossier.load(self.seed, "DomainIdentity", function(err, dossierHandler){
        if(err){
            throw err;
        }

        dossierHandler.startTransaction("DomainConfigTransaction", "getDomains").onReturn(function(err, domainConfigs){
            if(err){
                throw  err;
            }

            const se = require("swarm-engine");
            if(domainConfigs.length === 0){
                console.log("No domain configuration found in CSB. Boot process will stop here...");
                return;
            }
            self.domainConf = domainConfigs[0];

            for (const alias in self.domainConf.communicationInterfaces) {
                if (self.domainConf.communicationInterfaces.hasOwnProperty(alias)) {
                    let remoteUrls = self.domainConf.communicationInterfaces[alias];
                    let powerCordToDomain = new se.SmartRemoteChannelPowerCord([remoteUrls.virtualMQ + "/"], self.domainConf.alias, remoteUrls.zeroMQ);
                    $$.swarmEngine.plug("*", powerCordToDomain);
                }
            }

            dossierHandler.startTransaction("Agents", "getAgents").onReturn(function(err, agents){
                if(err){
                    throw err;
                }

                if (agents.length === 0) {
                    agents.push({alias: 'system'});
                }

                const EDFS = require("edfs");
                const bar = self.edfs.loadBar(self.seed);
                bar.readFile(EDFS.constants.CSB.CONSTITUTION_FOLDER + '/threadBoot.js', (err, fileContents) => {
                    if(err) {
                        throw err;
                    }

                    agents.forEach(agent => {
                        const agentPC = new se.OuterThreadPowerCord(fileContents.toString(), true, seed);
                        $$.swarmEngine.plug(`${self.domainConf.alias}/agent/${agent.alias}`, agentPC);
                    });

                    $$.event('status.domains.boot', {name: self.domainConf.alias});
                    console.log("Domain boot successfully");
                });
            });
        })
    });
}

boot();
},{"./BootEngine":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\BootEngine.js","dossier":"dossier","edfs":"edfs","path":false,"soundpubsub":"soundpubsub","swarm-engine":"swarm-engine"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\index.js":[function(require,module,exports){
module.exports = {
    getIsolatesBootScript: function() {
        return require('./IsolateBootScript');
    },
    getThreadBootScript: function() {
        return `(${require("./ThreadWorkerBootScript")})()`;
    },
    executeDomainBootScript: function() {
        return require('./domainBootScript');
    }
};
},{"./IsolateBootScript":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\IsolateBootScript.js","./ThreadWorkerBootScript":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\ThreadWorkerBootScript.js","./domainBootScript":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\domainBootScript.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\interactions\\InteractionSpace.js":[function(require,module,exports){
function InteractionSpace(swarmEngineApi) {
    const listeners = {};
    const interactionTemplate = require('./interaction_template').getTemplateHandler(swarmEngineApi);

    function createThis(swarm) {
        const thisObj = interactionTemplate.createForObject(swarm);
        //todo: implement a proxy for public and private vars...
        return thisObj;
    }

    this.dispatch = function (swarm) {
        const {swarmId, swarmTypeName, phaseName, args} = swarm.meta;

        const genericKey = `*/${swarmTypeName}/${phaseName}`;
        const particularKey = `${swarmId}/${swarmTypeName}/${phaseName}`;

        const handlers = listeners[particularKey] || listeners[genericKey] || [];

        handlers.forEach(fn => {
            fn.call(createThis(swarm), ...args);
        });

        if (phaseName === $$.swarmEngine.RETURN_PHASE_COMMAND) {
            delete listeners[particularKey];
        }

        if (handlers.length === 0) {
            console.log(`No implementation for phase "${phaseName}" was found`);
        }
    };

    this.on = function (swarmId, swarmTypeName, phaseName, handler) {
        const key = `${swarmId}/${swarmTypeName}/${phaseName}`;
        if (typeof listeners[key] === "undefined") {
            listeners[key] = [];
        }
        listeners[key].push(handler);
        swarmEngineApi.acknowledge("on", swarmId, swarmTypeName, phaseName, handler);
    };

    this.off = function (swarmId = '*', swarmTypeName = '*', phaseName = '*', handler) {

        function escapeIfStar(str) {
            return str.replace("*", "\\*")
        }

        swarmId = escapeIfStar(swarmId);
        swarmTypeName = escapeIfStar(swarmTypeName);
        phaseName = escapeIfStar(phaseName);

        const regexString = `(${swarmId})\\/(${swarmTypeName})\\/(${phaseName})`;
        const reg = new RegExp(regexString);

        const keys = Object.keys(listeners);
        keys.forEach(key => {
            if (key.match(reg)) {
                const handlers = listeners[key];

                if (!handler) {
                    listeners[key] = [];
                } else {
                    listeners[key] = handlers.filter(fn => fn !== handler);
                }
            }
        });
        swarmEngineApi.acknowledge("off", swarmId, swarmTypeName, phaseName, handler);
    };
}

module.exports = InteractionSpace;

},{"./interaction_template":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\interactions\\interaction_template.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\interactions\\index.js":[function(require,module,exports){
module.exports = function (swarmEngineApi) {
    let cm = require("callflow");
    const InteractionSpace = require("./InteractionSpace");
    const is = new InteractionSpace(swarmEngineApi);

    $$.interactions = {};
    //cm.createSwarmEngine("interaction", require("./interaction_template"));
    $$.interaction = $$.interactions;

    $$.interactions.attachTo = function (swarmTypeName, interactionDescription) {
        Object.keys(interactionDescription).forEach(phaseName => {
            is.on('*', swarmTypeName, phaseName, interactionDescription[phaseName]);
        });
    };

    $$.interactions.startSwarmAs = function (identity, swarmTypeName, phaseName, ...args) {
        const swarm = swarmEngineApi.startSwarmAs(identity, swarmTypeName, phaseName, ...args);
        let swarmId = swarm.getMeta('swarmId');

        return {
            on: function (interactionDescription) {
                Object.keys(interactionDescription).forEach(phaseName => {
                    is.on(swarmId, swarmTypeName, phaseName, interactionDescription[phaseName]);
                });

                return this;
            },
            off: function (interactionDescription) {
                is.off(interactionDescription);

                return this;
            },
            onReturn: function (callback) {
                is.on(swarmId, swarmTypeName, $$.swarmEngine.RETURN_PHASE_COMMAND, callback);

                return this;
            }
        }
    };

    return is;
};

},{"./InteractionSpace":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\interactions\\InteractionSpace.js","callflow":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\interactions\\interaction_template.js":[function(require,module,exports){
exports.getTemplateHandler = function (swarmEngineApi) {

    return {
        createForObject: function (valueObject, thisObject, localId) {
            let cm = require("callflow");

            let swarmFunction = function (destinationContext, phaseName, ...args) {
                //make the execution at level 0  (after all pending events) and wait to have a swarmId
                ret.observe(function () {
                    swarmEngineApi.sendSwarm(valueObject, $$.swarmEngine.EXECUTE_PHASE_COMMAND, destinationContext, phaseName, args);
                }, null, null);
                ret.notify();
                return thisObject;
            };

            function off() {
                const swarmId = valueObject.getMeta('swarmId');
                const swarmTypeName = valueObject.getMeta('swarmTypeName');

                swarmEngineApi.off(swarmId, swarmTypeName);
            }


            let ret = cm.createStandardAPIsForSwarms(valueObject, thisObject, localId);

            ret.swarm = swarmFunction;
            ret.swarmAs = swarmFunction;
            ret.off = off;

            delete ret.home;
            delete ret.onReturn;
            delete ret.onResult;

            delete ret.asyncReturn;
            delete ret.return;

            delete ret.autoInit;

            return ret;
        }
    }
};

},{"callflow":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\InnerIsolatePowerCord.js":[function(require,module,exports){
(function (global){
function InnerIsolatePowerCord() {

    let setterTransfer;

    function transfer(...args) {

        args = args.map(arg => {
            if(arg.buffer) {
                // transforming UInt8Array to ArrayBuffer
                arg = arg.buffer;
            }

            return arg;
        });

        return setterTransfer(...args);
    }

    Object.defineProperty(this, "transfer", {
        set: (fn) => {
            setterTransfer = fn;
        }, get: () => {
            return setterTransfer ? transfer : undefined;
        }
    });

    this.sendSwarm = function (swarmSerialization) {
        try{
            if(swarmSerialization instanceof ArrayBuffer) {
                swarmSerialization = global.createCopyIntoExternalCopy(new Uint8Array(swarmSerialization));
            }

            returnSwarm.apply(undefined, [null, swarmSerialization])
                .catch((err) => {
                    console.log(err);
                })
        }catch(err){
           console.log(err);
        }

    };

}

module.exports = InnerIsolatePowerCord;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\InnerThreadPowerCord.js":[function(require,module,exports){
function InnerThreadPowerCord() {
    const worker_threads = 'worker_threads';
    const {parentPort} = require(worker_threads);

    this.sendSwarm = function (swarmSerialization) {
        parentPort.postMessage(swarmSerialization);
    };

}

module.exports = InnerThreadPowerCord;

},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\OuterIsolatePowerCord.js":[function(require,module,exports){
function OuterIsolatePowerCord(energySource, numberOfWires = 1, apis) { // seed or array of constitution bundle paths
    const syndicate = require('syndicate');
    const bootScripts = require('../bootScripts');
    const pskisolates = require('pskisolates');
    let pool = null;


    function connectToEnergy() {
        const WorkerStrategies = syndicate.WorkerStrategies;

        if(!apis) {
            apis = {};
        }

        if(typeof apis.require === "undefined"){
            apis.require = function(name) {
                console.log('Creating proxy for', name);
                return pskisolates.createDeepReference(require(name));
            };
        }

        const config = {
            bootScript: bootScripts.getIsolatesBootScript(),
            maximumNumberOfWorkers: numberOfWires,
            workerStrategy: WorkerStrategies.ISOLATES,
            workerOptions: {
                workerData: {
                    constitutions: energySource
                },
                externalApi: apis
            }
        };

        pool = syndicate.createWorkerPool(config, (isolate) => {

            isolate.globalSetSync("getIdentity", () => {
                return superThis.identity;
            });
        });

    }

    let superThis = this;
    connectToEnergy();


    this.sendSwarm = function (swarmSerialization) {
        pool.addTask(swarmSerialization, (err, msg) => {
            if (err instanceof Error) {
                throw err;
            }

            this.transfer(msg.buffer || msg);
        });
    };

}

module.exports = OuterIsolatePowerCord;

},{"../bootScripts":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\index.js","pskisolates":false,"syndicate":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\OuterThreadPowerCord.js":[function(require,module,exports){
function OuterThreadPowerCord(threadBootScript, eval= false, energySourceSeed, numberOfWires = 1) { // seed or array of constitution bundle paths
    const syndicate = require('syndicate');
    let pool = null;
    let self = this;

    function connectToEnergy() {
        const config = {
            maximumNumberOfWorkers: numberOfWires,
            workerStrategy: syndicate.WorkerStrategies.THREADS,
            bootScript: threadBootScript,
            workerOptions: {
                // cwd: process.env.DOMAIN_WORKSPACE,
                eval: eval,
                env: {
                    IDENTITY: self.identity
                },
                workerData: {
                    constitutionSeed: energySourceSeed
                }
            }
        };

        pool = syndicate.createWorkerPool(config);

    }

    this.sendSwarm = function (swarmSerialization) {
        pool.addTask(swarmSerialization, (err, msg) => {
            if (err instanceof Error) {
                throw err;
            }

            this.transfer(msg.buffer || msg);
        });
    };

    return new Proxy(this, {
        set(target, p, value, receiver) {
            target[p] = value;
            if(p === 'identity') {
                connectToEnergy();
            }
        }
    })
}

module.exports = OuterThreadPowerCord;

},{"syndicate":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\RemoteChannelPairPowerCord.js":[function(require,module,exports){
const outbound = "outbound";
const inbound = "inbound";

function RemoteChannelPairPowerCord(host, channelName, receivingHost, receivingChannelName){

    receivingHost = receivingHost || host;
    receivingChannelName = receivingChannelName || generateChannelName();

    function setup(){
        //injecting necessary http methods
        require("../../psk-http-client");

        //this should be a channel that exists... we don't try to create
        $$.remote.registerHttpChannelClient(outbound, host, channelName, {autoCreate: false});
        $$.remote[outbound].setSenderMode();

        //maybe instead of receivingChannelName we sould use our identity? :-??
        $$.remote.registerHttpChannelClient(inbound, receivingHost, receivingChannelName, {autoCreate: true});
        $$.remote[inbound].setReceiverMode();

        $$.remote[inbound].on("*", "*", "*", function (err, swarmSerialization){
            const swarmUtils = require("swarmutils");
            const SwarmPacker = swarmUtils.SwarmPacker;
            let header = SwarmPacker.getHeader(swarmSerialization);
            if(header.swarmTarget === $$.remote[inbound].getReceiveAddress() && startedSwarms[header.swarmId] === true){
                //it is a swarm that we started
                let message = swarmUtils.OwM.prototype.convert(SwarmPacker.unpack(swarmSerialization));
                //we set the correct target
                message.setMeta("target", identityOfOurSwarmEngineInstance);
                //... and transfer to our swarm engine instance
                self.transfer(SwarmPacker.pack(message, SwarmPacker.getSerializer(header.serializationType)));
            }else{
                self.transfer(swarmSerialization);
            }
        });
    }

    let identityOfOurSwarmEngineInstance;
    let startedSwarms = {};
    const self = this;
    this.sendSwarm = function (swarmSerialization) {
        const swarmUtils = require("swarmutils");
        const SwarmPacker = swarmUtils.SwarmPacker;
        let header = SwarmPacker.getHeader(swarmSerialization);
        let message = swarmUtils.OwM.prototype.convert(SwarmPacker.unpack(swarmSerialization));

        if(typeof message.publicVars === "undefined"){
            startedSwarms[message.getMeta("swarmId")] = true;

            //it is the start of swarm...
            if(typeof identityOfOurSwarmEngineInstance === "undefined"){
                identityOfOurSwarmEngineInstance = message.getMeta("homeSecurityContext");
            }
            //we change homeSecurityContext with a url in order to get back the swarm when is done.
            message.setMeta("homeSecurityContext", $$.remote[inbound].getReceiveAddress());
            //send the updated version of it
            $$.remote[outbound].sendSwarm(SwarmPacker.pack(message, SwarmPacker.getSerializer(header.serializationType)));
        }else{
            //the swarm was not started from our pair swarm engine so we just send it
            $$.remote[outbound].sendSwarm(swarmSerialization);
        }
    };

    function generateChannelName(){
        return Math.random().toString(36).substr(2, 9);
    }

    return new Proxy(this, {
        set(target, p, value, receiver) {
            target[p] = value;
            if(p === 'identity') {
                setup();
            }
        }
    });
}

module.exports = RemoteChannelPairPowerCord;
},{"../../psk-http-client":"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\index.js","swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\RemoteChannelPowerCord.js":[function(require,module,exports){
const inbound = "inbound";

function RemoteChannelPowerCord(receivingHost, receivingChannelName){

    receivingHost = receivingHost || host;
    receivingChannelName = receivingChannelName || generateChannelName();

    let setup = ()=>{
        //injecting necessary http methods
        require("../../psk-http-client");

        //maybe instead of receivingChannelName we sould use our identity? :-??
        $$.remote.registerHttpChannelClient(inbound, receivingHost, receivingChannelName, {autoCreate: true});
        $$.remote[inbound].setReceiverMode();

        this.on("*", "*", "*", (err, result)=>{
            if(!err){
                console.log("We got a swarm for channel");
                this.transfer(result);
            }else{
                console.log("Got an error from our channel", err);
            }
        });
    };

    this.on = function(swarmId, swarmName, swarmPhase, callback){
        $$.remote[inbound].on(swarmId, swarmName, swarmPhase, callback);
    };

    this.off = function(swarmId, swarmName, swarmPhase, callback){

    };

    this.sendSwarm = function (swarmSerialization) {
        const SwarmPacker = require("swarmutils").SwarmPacker;
        let header = SwarmPacker.getHeader(swarmSerialization);
        let target = header.swarmTarget;
        console.log("Sending swarm to", target);
        //test if target is an url... else complain
        if(true){
            $$.remote.doHttpPost(target, swarmSerialization, (err, res)=>{

            });
        }else{

        }
    };

    function generateChannelName(){
        return Math.random().toString(36).substr(2, 9);
    }

    return new Proxy(this, {
        set(target, p, value, receiver) {
            target[p] = value;
            if(p === 'identity') {
                setup();
            }
        }
    });
}

module.exports = RemoteChannelPowerCord;
},{"../../psk-http-client":"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\index.js","swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\SmartRemoteChannelPowerCord.js":[function(require,module,exports){
(function (Buffer){
const inbound = "inbound";

function SmartRemoteChannelPowerCord(communicationAddrs, receivingChannelName, zeroMQAddress) {

    //here are stored, for later use, fav hosts for different identities
    const favoriteHosts = {};
    let receivingHost = Array.isArray(communicationAddrs) && communicationAddrs.length > 0 ? communicationAddrs[0] : "http://127.0.0.1";
    receivingChannelName = receivingChannelName || generateChannelName();

    let setup = () => {
        //injecting necessary http methods
        require("../../psk-http-client");

        const opts = {autoCreate: true, enableForward: typeof zeroMQAddress !== "undefined", publicSignature: "none"};

        console.log(`\n[***] Using channel "${receivingChannelName}" on "${receivingHost}".\n`);
        //maybe instead of receivingChannelName we sould use our identity? :-??
        $$.remote.registerHttpChannelClient(inbound, receivingHost, receivingChannelName, opts);
        $$.remote[inbound].setReceiverMode();

        function toArrayBuffer(buffer) {
            const ab = new ArrayBuffer(buffer.length);
            const view = new Uint8Array(ab);
            for (let i = 0; i < buffer.length; ++i) {
                view[i] = buffer[i];
            }
            return ab;
        }


        if (typeof zeroMQAddress === "undefined") {
            $$.remote[inbound].on("*", "*", "*", (err, swarmSerialization) => {
                if (err) {
                    console.log("Got an error from our channel", err);
                    return;
                }

                if(Buffer && Buffer.isBuffer(swarmSerialization)){
                    swarmSerialization = toArrayBuffer(swarmSerialization);
                }

                handlerSwarmSerialization(swarmSerialization);
            });
        } else {
            //let's connect to zmq
            const reqFactory = require("virtualmq").getVMQRequestFactory(receivingHost, zeroMQAddress);
            reqFactory.receiveMessageFromZMQ($$.remote.base64Encode(receivingChannelName), opts.publicSignature, (...args) => {
                console.log("zeromq connection established");
            }, (channelName, swarmSerialization) => {
                console.log("Look", channelName, swarmSerialization);
                handlerSwarmSerialization(swarmSerialization);
            });
        }
    };

    /* this.on = function(swarmId, swarmName, swarmPhase, callback){
         $$.remote[inbound].on(swarmId, swarmName, swarmPhase, callback);
     };

     this.off = function(swarmId, swarmName, swarmPhase, callback){

     };*/

    function getMetaFromIdentity(identity){
        const vRegex = /([a-zA-Z0-9]*|.)*\/agent\/([a-zA-Z0-9]+(\/)*)+/g;

        if(!identity.match(vRegex)){
            throw new Error("Invalid format. (Eg. domain[.subdomain]*/agent/[organisation/]*agentId)");
        }

        const separatorKeyword = "/agent/";
        let domain;
        let agentIdentity;

        const splitPoint = identity.indexOf(separatorKeyword);
        if(splitPoint !== -1){
            domain = identity.slice(0, splitPoint);
            agentIdentity = identity.slice(splitPoint+separatorKeyword.length);
        }

        return {domain, agentIdentity};
    }

    function handlerSwarmSerialization(swarmSerialization) {
        const swarmUtils = require("swarmutils");
        const SwarmPacker = swarmUtils.SwarmPacker;
        let header = SwarmPacker.getHeader(swarmSerialization);
        if (header.swarmTarget === $$.remote[inbound].getReceiveAddress() && startedSwarms[header.swarmId] === true) {
            //it is a swarm that we started
            let message = swarmUtils.OwM.prototype.convert(SwarmPacker.unpack(swarmSerialization));
            //we set the correct target
            message.setMeta("target", identityOfOurSwarmEngineInstance);
            //... and transfer to our swarm engine instance
            self.transfer(SwarmPacker.pack(message, SwarmPacker.getSerializer(header.serializationType)));
        } else {
            self.transfer(swarmSerialization);
        }
    }

    let identityOfOurSwarmEngineInstance;
    let startedSwarms = {};
    const self = this;
    this.sendSwarm = function (swarmSerialization) {
        const swarmUtils = require("swarmutils");
        const SwarmPacker = swarmUtils.SwarmPacker;
        let header = SwarmPacker.getHeader(swarmSerialization);
        let message = swarmUtils.OwM.prototype.convert(SwarmPacker.unpack(swarmSerialization));

        if (typeof message.publicVars === "undefined") {
            startedSwarms[message.getMeta("swarmId")] = true;

            //it is the start of swarm...
            if (typeof identityOfOurSwarmEngineInstance === "undefined") {
                identityOfOurSwarmEngineInstance = message.getMeta("homeSecurityContext");
            }
            //we change homeSecurityContext with a url in order to get back the swarm when is done.
            message.setMeta("homeSecurityContext", $$.remote[inbound].getReceiveAddress());

            swarmSerialization = SwarmPacker.pack(message, SwarmPacker.getSerializer(header.serializationType));
        }

        let target = header.swarmTarget;
        console.log("Sending swarm to", target);
        const urlRegex = new RegExp(/^(www|http:|https:)+[^\s]+[\w]/);

        if (urlRegex.test(target)) {
            $$.remote.doHttpPost(target, swarmSerialization, (err, res) => {
                if (err) {
                    console.log(err);
                }
            });
        } else {
            deliverSwarmToRemoteChannel(target, swarmSerialization, 0);
        }
    };

    function deliverSwarmToRemoteChannel(target, swarmSerialization, remoteIndex) {
        let identityMeta;
        try{
            identityMeta = getMetaFromIdentity(target);
        }catch(err){
            //identityMeta = {};
            console.log(err);
        }

        if (remoteIndex >= communicationAddrs.length) {
            //end of the line
            console.log(`Unable to deliver swarm to target "${target}" on any of the remote addresses provided.`);
            return;
        }
        const currentAddr = communicationAddrs[remoteIndex];
        //if we don't have a fav host for target then lets start discovery process...
        const remoteChannelAddr = favoriteHosts[identityMeta.domain] || [currentAddr, "send-message/", $$.remote.base64Encode(identityMeta.domain) + "/"].join("");

        $$.remote.doHttpPost(remoteChannelAddr, swarmSerialization, (err, res) => {
            if (err) {
                setTimeout(() => {
                    deliverSwarmToRemoteChannel(target, swarmSerialization, ++remoteIndex);
                }, 10);
            } else {
                //success: found fav host for target
                favoriteHosts[identityMeta.domain] = remoteChannelAddr;
                console.log("Found our fav", remoteChannelAddr, "for target", target);
            }
        });
    }

    function generateChannelName() {
        return Math.random().toString(36).substr(2, 9);
    }

    return new Proxy(this, {
        set(target, p, value, receiver) {
            target[p] = value;
            if (p === 'identity') {
                setup();
            }
        }
    });
}

module.exports = SmartRemoteChannelPowerCord;
}).call(this,require("buffer").Buffer)

},{"../../psk-http-client":"D:\\Catalin\\Munca\\privatesky\\modules\\psk-http-client\\index.js","buffer":false,"swarmutils":"swarmutils","virtualmq":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\browser\\HostPowerCord.js":[function(require,module,exports){
function HostPowerCord(parent){

    this.sendSwarm = function (swarmSerialization){
        parent.postMessage(swarmSerialization, "*");
    };

    let receivedMessageHandler  = (event)=>{
        console.log("Message received in iframe",event);
        let swarmSerialization = event.data;
        this.transfer(swarmSerialization);
    };

    let subscribe = () => {
        if(!window.iframePCMessageHandler){
            window.iframePCMessageHandler = receivedMessageHandler;
            window.addEventListener("message",receivedMessageHandler)
        }
    };


    return new Proxy(this, {
        set(target, p, value, receiver) {
            target[p] = value;
            if(p === 'identity') {
                subscribe.call(target);
            }
        }
    });
}


module.exports = HostPowerCord;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\browser\\IframePowerCord.js":[function(require,module,exports){
function IframePowerCord(iframe){

    let iframeSrc = iframe.src;

    this.sendSwarm = function (swarmSerialization){
        const SwarmPacker = require("swarmutils").SwarmPacker;

        try {
           SwarmPacker.getHeader(swarmSerialization);
        }
        catch (e) {
            console.error("Could not deserialize swarm");
        }

        if(iframe && iframe.contentWindow){
            iframe.contentWindow.postMessage(swarmSerialization, iframe.src);
        }
        else{
            //TODO: check if the iframe/psk-app should be loaded again
            console.error(`Iframe is no longer available. ${iframeSrc}`);
        }

    };

    let receivedMessageHandler  = (event)=>{

        if (event.source !== window) {
            console.log("Message received in parent", event);
            this.transfer(event.data);
        }

    };

    let subscribe = () => {

        // if(this.identity && this.identity!=="*"){
        // }
        // else{
        //     //TODO: you should use a power cord capable of handling * identities.
        //     console.error("Cannot handle identity '*'. You should use a power cord capable of handling '*' identities.")
        // }

        if(!window.iframePCMessageHandler){
            window.iframePCMessageHandler = receivedMessageHandler;
            window.addEventListener("message",receivedMessageHandler)
        }
    };

    return new Proxy(this, {
        set(target, p, value, receiver) {
            target[p] = value;
            if(p === 'identity') {
                subscribe.call(target);
            }
        }
    });
}

module.exports = IframePowerCord;
},{"swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\swarms\\index.js":[function(require,module,exports){
module.exports = function(swarmEngineApi){
    const cm = require("callflow");
    const swarmUtils = require("./swarm_template-se");

    $$.swarms           = cm.createSwarmEngine("swarm", swarmUtils.getTemplateHandler(swarmEngineApi));
    $$.swarm            = $$.swarms;

    $$.swarms.startAs = function(identity, swarmName, ctor, ...params){
        swarmEngineApi.startSwarmAs(identity, swarmName, ctor, ...params);
    };
};
},{"./swarm_template-se":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\swarms\\swarm_template-se.js","callflow":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\swarms\\swarm_template-se.js":[function(require,module,exports){
exports.getTemplateHandler = function (swarmEngine) {
    let cm = require("callflow");

    let beesHealer = require("swarmutils").beesHealer;
    return {
        createForObject: function (valueObject, thisObject, localId) {

            function messageIdentityFilter(valueObject) {
                return valueObject.meta.swarmId;
            }

            let swarmFunction = function (destinationContext, phaseName, ...args) {
                //make the execution at level 0  (after all pending events) and wait to have a swarmId
                ret.observe(function () {
                    swarmEngine.sendSwarm(valueObject, $$.swarmEngine.EXECUTE_PHASE_COMMAND, destinationContext, phaseName, args);
                }, null, null);
                ret.notify();
                return thisObject;
            };

            let asyncReturn = function (err, result) {

                let destinationContext = valueObject.meta[$$.swarmEngine.META_SECURITY_HOME_CONTEXT];
                if (!destinationContext && valueObject.meta[$$.swarmEngine.META_WAITSTACK]) {
                    destinationContext = valueObject.meta[$$.swarmEngine.META_WAITSTACK].pop();
                }
                if (!destinationContext) {
                    destinationContext = valueObject.meta[$$.swarmEngine.META_SECURITY_HOME_CONTEXT];
                }

                const {OwM} = require("swarmutils");
                const swarmClone = OwM.prototype.convert(JSON.parse(JSON.stringify(valueObject)));

                swarmEngine.sendSwarm(swarmClone, $$.swarmEngine.RETURN_PHASE_COMMAND, destinationContext, $$.swarmEngine.RETURN_PHASE_COMMAND, [err, result]);
            };

            function interact(phaseName, ...args) {
                const {OwM} = require("swarmutils");
                const swarmClone = OwM.prototype.convert(JSON.parse(JSON.stringify(valueObject)));
                let destinationContext = valueObject.meta[$$.swarmEngine.META_SECURITY_HOME_CONTEXT];

                swarmEngine.sendSwarm(swarmClone, $$.swarmEngine.EXECUTE_INTERACT_PHASE_COMMAND, destinationContext, phaseName, args);
            }

            function home(err, result) {
                let homeContext = valueObject.meta[$$.swarmEngine.META_SECURITY_HOME_CONTEXT];
                swarmEngine.sendSwarm(valueObject, $$.swarmEngine.RETURN_PHASE_COMMAND, homeContext, $$.swarmEngine.RETURN_PHASE_COMMAND, [err, result]);
            }

            function waitResults(callback, keepAliveCheck, swarm) {
                if (!swarm) {
                    swarm = this;
                }
                if (!keepAliveCheck) {
                    keepAliveCheck = function () {
                        return false;
                    }
                }
                var inner = swarm.getInnerValue();
                if (!inner.meta[$$.swarmEngine.META_WAITSTACK]) {
                    inner.meta[$$.swarmEngine.META_WAITSTACK] = [];
                    inner.meta[$$.swarmEngine.META_WAITSTACK].push($$.HRN_securityContext)
                }
                swarmEngine.waitForSwarm(callback, swarm, keepAliveCheck);
            }


            let ret = cm.createStandardAPIsForSwarms(valueObject, thisObject, localId);

            ret.interact        = interact;
            ret.swarm           = swarmFunction;
            ret.home            = home;
            ret.onReturn        = waitResults;
            ret.onResult        = waitResults;
            ret.asyncReturn     = asyncReturn;
            ret.return          = asyncReturn;

            ret.autoInit = function (someContext) {

            };

            return ret;
        }
    }
};
},{"callflow":false,"swarmutils":"swarmutils"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\Combos.js":[function(require,module,exports){
function product(args) {
    if(!args.length){
        return [ [] ];
    }
    var prod = product(args.slice(1)), r = [];
    args[0].forEach(function(x) {
        prod.forEach(function(p) {
            r.push([ x ].concat(p));
        });
    });
    return r;
}

function objectProduct(obj) {
    var keys = Object.keys(obj),
        values = keys.map(function(x) { return obj[x]; });

    return product(values).map(function(p) {
        var e = {};
        keys.forEach(function(k, n) { e[k] = p[n]; });
        return e;
    });
}

module.exports = objectProduct;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\OwM.js":[function(require,module,exports){
var meta = "meta";

function OwM(serialized){

    if(serialized){
        return OwM.prototype.convert(serialized);
    }

    Object.defineProperty(this, meta, {
        writable: false,
        enumerable: true,
        value: {}
    });

    Object.defineProperty(this, "setMeta", {
        writable: false,
        enumerable: false,
        configurable:false,
        value: function(prop, value){
            if(typeof prop == "object" && typeof value == "undefined"){
                for(var p in prop){
                    this[meta][p] = prop[p];
                }
                return prop;
            }
            this[meta][prop] = value;
            return value;
        }
    });

    Object.defineProperty(this, "getMeta", {
        writable: false,
        value: function(prop){
            return this[meta][prop];
        }
    });
}

function testOwMSerialization(obj){
    let res = false;

    if(obj){
        res = typeof obj[meta] != "undefined" && !(obj instanceof OwM);
    }

    return res;
}

OwM.prototype.convert = function(serialized){
    const owm = new OwM();

    for(var metaProp in serialized.meta){
        if(!testOwMSerialization(serialized[metaProp])) {
            owm.setMeta(metaProp, serialized.meta[metaProp]);
        }else{
            owm.setMeta(metaProp, OwM.prototype.convert(serialized.meta[metaProp]));
        }
    }

    for(var simpleProp in serialized){
        if(simpleProp === meta) {
            continue;
        }

        if(!testOwMSerialization(serialized[simpleProp])){
            owm[simpleProp] = serialized[simpleProp];
        }else{
            owm[simpleProp] = OwM.prototype.convert(serialized[simpleProp]);
        }
    }

    return owm;
};

OwM.prototype.getMetaFrom = function(obj, name){
    var res;
    if(!name){
        res = obj[meta];
    }else{
        res = obj[meta][name];
    }
    return res;
};

OwM.prototype.setMetaFor = function(obj, name, value){
    obj[meta][name] = value;
    return obj[meta][name];
};

module.exports = OwM;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\Queue.js":[function(require,module,exports){
function QueueElement(content) {
	this.content = content;
	this.next = null;
}

function Queue() {
	this.head = null;
	this.tail = null;
	this.length = 0;
	this.push = function (value) {
		const newElement = new QueueElement(value);
		if (!this.head) {
			this.head = newElement;
			this.tail = newElement;
		} else {
			this.tail.next = newElement;
			this.tail = newElement;
		}
		this.length++;
	};

	this.pop = function () {
		if (!this.head) {
			return null;
		}
		const headCopy = this.head;
		this.head = this.head.next;
		this.length--;

		//fix???????
		if(this.length === 0){
            this.tail = null;
		}

		return headCopy.content;
	};

	this.front = function () {
		return this.head ? this.head.content : undefined;
	};

	this.isEmpty = function () {
		return this.head === null;
	};

	this[Symbol.iterator] = function* () {
		let head = this.head;
		while(head !== null) {
			yield head.content;
			head = head.next;
		}
	}.bind(this);
}

Queue.prototype.toString = function () {
	let stringifiedQueue = '';
	let iterator = this.head;
	while (iterator) {
		stringifiedQueue += `${JSON.stringify(iterator.content)} `;
		iterator = iterator.next;
	}
	return stringifiedQueue;
};

Queue.prototype.inspect = Queue.prototype.toString;

module.exports = Queue;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\SwarmPacker.js":[function(require,module,exports){
const HEADER_SIZE_RESEARVED = 4;

function SwarmPacker(){
}

function copyStringtoArrayBuffer(str, buffer){
    if(typeof str !== "string"){
        throw new Error("Wrong param type received");
    }
    for(var i = 0; i < str.length; i++) {
        buffer[i] = str.charCodeAt(i);
    }
    return buffer;
}

function copyFromBuffer(target, source){
    for(let i=0; i<source.length; i++){
        target[i] = source[i];
    }
    return target;
}

let serializers = {};

SwarmPacker.registerSerializer = function(name, implementation){
    if(serializers[name]){
        throw new Error("Serializer name already exists");
    }
    serializers[name] = implementation;
};

function getSerializer(name){
    return serializers[name];
}

SwarmPacker.getSerializer = getSerializer;

Object.defineProperty(SwarmPacker.prototype, "JSON", {value: "json"});
Object.defineProperty(SwarmPacker.prototype, "MSGPACK", {value: "msgpack"});

SwarmPacker.registerSerializer(SwarmPacker.prototype.JSON, {
    serialize: JSON.stringify,
    deserialize: (serialization)=>{
        if(typeof serialization !== "string"){
            serialization = String.fromCharCode.apply(null, serialization);
        }
        return JSON.parse(serialization);
    },
    getType: ()=>{
        return SwarmPacker.prototype.JSON;
    }
});

function registerMsgPackSerializer(){
    const mp = '@msgpack/msgpack';
    let msgpack;

    try{
        msgpack = require(mp);
        if (typeof msgpack === "undefined") {
            throw new Error("msgpack is unavailable.")
        }
    }catch(err){
        console.log("msgpack not available. If you need msgpack serialization include msgpack in one of your bundles");
        //preventing msgPack serializer being register if msgPack dep is not found.
        return;
    }

    SwarmPacker.registerSerializer(SwarmPacker.prototype.MSGPACK, {
        serialize: msgpack.encode,
        deserialize: msgpack.decode,
        getType: ()=>{
            return SwarmPacker.prototype.MSGPACK;
        }
    });
}

registerMsgPackSerializer();

SwarmPacker.pack = function(swarm, serializer){

    let jsonSerializer = getSerializer(SwarmPacker.prototype.JSON);
    if(typeof serializer === "undefined"){
        serializer = jsonSerializer;
    }

    let swarmSerialization = serializer.serialize(swarm);

    let header = {
        command: swarm.getMeta("command"),
        swarmId : swarm.getMeta("swarmId"),
        swarmTypeName: swarm.getMeta("swarmTypeName"),
        swarmTarget: swarm.getMeta("target"),
        serializationType: serializer.getType()
    };

    header = serializer.serialize(header);

    if(header.length >= Math.pow(2, 32)){
        throw new Error("Swarm serialization too big.");
    }

    //arraybuffer construction
    let size = HEADER_SIZE_RESEARVED + header.length + swarmSerialization.length;
    let pack = new ArrayBuffer(size);

    let sizeHeaderView = new DataView(pack, 0);
    sizeHeaderView.setUint32(0, header.length);

    let headerView = new Uint8Array(pack, HEADER_SIZE_RESEARVED);
    copyStringtoArrayBuffer(header, headerView);

    let serializationView = new Uint8Array(pack, HEADER_SIZE_RESEARVED+header.length);
    if(typeof swarmSerialization === "string"){
        copyStringtoArrayBuffer(swarmSerialization, serializationView);
    }else{
        copyFromBuffer(serializationView, swarmSerialization);
    }

    return pack;
};

SwarmPacker.unpack = function(pack){
    let jsonSerialiser = SwarmPacker.getSerializer(SwarmPacker.prototype.JSON);
    let headerSerialization = getHeaderSerializationFromPack(pack);
    let header = jsonSerialiser.deserialize(headerSerialization);

    let serializer = SwarmPacker.getSerializer(header.serializationType);
    let messageView = new Uint8Array(pack, HEADER_SIZE_RESEARVED+headerSerialization.length);

    let swarm = serializer.deserialize(messageView);
    return swarm;
};

function getHeaderSerializationFromPack(pack){
    let headerSize = new DataView(pack).getUint32(0);

    let headerView = new Uint8Array(pack, HEADER_SIZE_RESEARVED, headerSize);
    return headerView;
}

SwarmPacker.getHeader = function(pack){
    let jsonSerialiser = SwarmPacker.getSerializer(SwarmPacker.prototype.JSON);
    let header = jsonSerialiser.deserialize(getHeaderSerializationFromPack(pack));

    return header;
};
module.exports = SwarmPacker;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\TaskCounter.js":[function(require,module,exports){

function TaskCounter(finalCallback) {
	let results = [];
	let errors = [];

	let started = 0;

	function decrement(err, res) {
		if(err) {
			errors.push(err);
		}

		if(arguments.length > 2) {
			arguments[0] = undefined;
			res = arguments;
		}

		if(typeof res !== "undefined") {
			results.push(res);
		}

		if(--started <= 0) {
            return callCallback();
		}
	}

	function increment(amount = 1) {
		started += amount;
	}

	function callCallback() {
	    if(errors && errors.length === 0) {
	        errors = undefined;
        }

	    if(results && results.length === 0) {
	        results = undefined;
        }

        finalCallback(errors, results);
    }

	return {
		increment,
		decrement
	};
}

module.exports = TaskCounter;
},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\beesHealer.js":[function(require,module,exports){
const OwM = require("./OwM");

/*
    Prepare the state of a swarm to be serialised
*/

exports.asJSON = function(valueObj, phaseName, args, callback){

        let valueObject = valueObj.valueOf();
        let res = new OwM();
        res.publicVars          = valueObject.publicVars;
        res.privateVars         = valueObject.privateVars;

        res.setMeta("COMMAND_ARGS",        OwM.prototype.getMetaFrom(valueObject, "COMMAND_ARGS"));
        res.setMeta("SecurityParadigm",        OwM.prototype.getMetaFrom(valueObject, "SecurityParadigm"));
        res.setMeta("swarmTypeName", OwM.prototype.getMetaFrom(valueObject, "swarmTypeName"));
        res.setMeta("swarmId",       OwM.prototype.getMetaFrom(valueObject, "swarmId"));
        res.setMeta("target",        OwM.prototype.getMetaFrom(valueObject, "target"));
        res.setMeta("homeSecurityContext",        OwM.prototype.getMetaFrom(valueObject, "homeSecurityContext"));
        res.setMeta("requestId",        OwM.prototype.getMetaFrom(valueObject, "requestId"));


        if(!phaseName){
            res.setMeta("command", "stored");
        } else {
            res.setMeta("phaseName", phaseName);
            res.setMeta("phaseId", $$.uidGenerator.safe_uuid());
            res.setMeta("args", args);
            res.setMeta("command", OwM.prototype.getMetaFrom(valueObject, "command") || "executeSwarmPhase");
        }

        res.setMeta("waitStack", valueObject.meta.waitStack); //TODO: think if is not better to be deep cloned and not referenced!!!

        if(callback){
            return callback(null, res);
        }
        //console.log("asJSON:", res, valueObject);
        return res;
};

exports.jsonToNative = function(serialisedValues, result){

    for(let v in serialisedValues.publicVars){
        result.publicVars[v] = serialisedValues.publicVars[v];

    };
    for(let l in serialisedValues.privateVars){
        result.privateVars[l] = serialisedValues.privateVars[l];
    };

    for(let i in OwM.prototype.getMetaFrom(serialisedValues)){
        OwM.prototype.setMetaFor(result, i, OwM.prototype.getMetaFrom(serialisedValues, i));
    };

};
},{"./OwM":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\OwM.js"}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\pingpongFork.js":[function(require,module,exports){
const PING = "PING";
const PONG = "PONG";

module.exports.fork = function pingPongFork(modulePath, args, options){
    const child_process = require("child_process");
    const defaultStdio = ["inherit", "inherit", "inherit", "ipc"];

    if(!options){
        options = {stdio: defaultStdio};
    }else{
        if(typeof options.stdio === "undefined"){
            options.stdio = defaultStdio;
        }

        let stdio = options.stdio;
        if(stdio.length<3){
            for(let i=stdio.length; i<4; i++){
                stdio.push("inherit");
            }
            stdio.push("ipc");
        }
    }

    let child = child_process.fork(modulePath, args, options);

    child.on("message", (message)=>{
        if(message === PING){
            child.send(PONG);
        }
    });

    return child;
};

module.exports.enableLifeLine = function(timeout){

    if(typeof process.send === "undefined"){
        console.log("\"process.send\" not found. LifeLine mechanism disabled!");
        return;
    }

    let lastConfirmationTime;
    const interval = timeout || 2000;

    // this is needed because new Date().getTime() has reduced precision to mitigate timer based attacks
    // for more information see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime
    const roundingError = 101;

    function sendPing(){
        try {
            process.send(PING);
        } catch (e) {
            console.log('Parent is not available, shutting down');
            exit(1)
        }
    }

    process.on("message", function (message){
        if(message === PONG){
            lastConfirmationTime = new Date().getTime();
        }
    });

    function exit(code){
        setTimeout(()=>{
            process.exit(code);
        }, 0);
    }

    const exceptionEvents = ["SIGINT", "SIGUSR1", "SIGUSR2", "uncaughtException", "SIGTERM", "SIGHUP"];
    let killingSignal = false;
    for(let i=0; i<exceptionEvents.length; i++){
        process.on(exceptionEvents[i], (event, code)=>{
            killingSignal = true;
            clearInterval(timeoutInterval);
            console.log(`Caught event type [${exceptionEvents[i]}]. Shutting down...`, code, event);
            exit(code);
        });
    }

    const timeoutInterval = setInterval(function(){
        const currentTime = new Date().getTime();

        if(typeof lastConfirmationTime === "undefined" || currentTime - lastConfirmationTime < interval + roundingError && !killingSignal){
            sendPing();
        }else{
            console.log("Parent process did not answer. Shutting down...", process.argv, killingSignal);
            exit(1);
        }
    }, interval);
};
},{"child_process":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\pskconsole.js":[function(require,module,exports){
var commands = {};
var commands_help = {};

//global function addCommand
addCommand = function addCommand(verb, adverbe, funct, helpLine){
    var cmdId;
    if(!helpLine){
        helpLine = " ";
    } else {
        helpLine = " " + helpLine;
    }
    if(adverbe){
        cmdId = verb + " " +  adverbe;
        helpLine = verb + " " +  adverbe + helpLine;
    } else {
        cmdId = verb;
        helpLine = verb + helpLine;
    }
    commands[cmdId] = funct;
        commands_help[cmdId] = helpLine;
};

function doHelp(){
    console.log("List of commands:");
    for(var l in commands_help){
        console.log("\t", commands_help[l]);
    }
}

addCommand("-h", null, doHelp, "\t\t\t\t\t\t |just print the help");
addCommand("/?", null, doHelp, "\t\t\t\t\t\t |just print the help");
addCommand("help", null, doHelp, "\t\t\t\t\t\t |just print the help");


function runCommand(){
  var argv = Object.assign([], process.argv);
  var cmdId = null;
  var cmd = null;
  argv.shift();
  argv.shift();

  if(argv.length >=1){
      cmdId = argv[0];
      cmd = commands[cmdId];
      argv.shift();
  }


  if(!cmd && argv.length >=1){
      cmdId = cmdId + " " + argv[0];
      cmd = commands[cmdId];
      argv.shift();
  }

  if(!cmd){
    if(cmdId){
        console.log("Unknown command: ", cmdId);
    }
    cmd = doHelp;
  }

  cmd.apply(null,argv);

}

module.exports = {
    runCommand
};


},{}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\safe-uuid.js":[function(require,module,exports){

function encode(buffer) {
    return buffer.toString('base64')
        .replace(/\+/g, '')
        .replace(/\//g, '')
        .replace(/=+$/, '');
};

function stampWithTime(buf, salt, msalt){
    if(!salt){
        salt = 1;
    }
    if(!msalt){
        msalt = 1;
    }
    var date = new Date;
    var ct = Math.floor(date.getTime() / salt);
    var counter = 0;
    while(ct > 0 ){
        //console.log("Counter", counter, ct);
        buf[counter*msalt] = Math.floor(ct % 256);
        ct = Math.floor(ct / 256);
        counter++;
    }
}

/*
    The uid contains around 256 bits of randomness and are unique at the level of seconds. This UUID should by cryptographically safe (can not be guessed)

    We generate a safe UID that is guaranteed unique (by usage of a PRNG to geneate 256 bits) and time stamping with the number of seconds at the moment when is generated
    This method should be safe to use at the level of very large distributed systems.
    The UUID is stamped with time (seconds): does it open a way to guess the UUID? It depends how safe is "crypto" PRNG, but it should be no problem...

 */

var generateUid = null;


exports.init = function(externalGenerator){
    generateUid = externalGenerator.generateUid;
    return module.exports;
};

exports.safe_uuid = function() {
    var buf = generateUid(32);
    stampWithTime(buf, 1000, 3);
    return encode(buf);
};



/*
    Try to generate a small UID that is unique against chance in the same millisecond second and in a specific context (eg in the same choreography execution)
    The id contains around 6*8 = 48  bits of randomness and are unique at the level of milliseconds
    This method is safe on a single computer but should be used with care otherwise
    This UUID is not cryptographically safe (can be guessed)
 */
exports.short_uuid = function(callback) {
    require('crypto').randomBytes(12, function (err, buf) {
        if (err) {
            callback(err);
            return;
        }
        stampWithTime(buf,1,2);
        callback(null, encode(buf));
    });
};
},{"crypto":false}],"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\uidGenerator.js":[function(require,module,exports){
(function (Buffer){
const crypto = require('crypto');
const Queue = require("./Queue");
var PSKBuffer = typeof $$ !== "undefined" && $$.PSKBuffer ? $$.PSKBuffer : Buffer;

function UidGenerator(minBuffers, buffersSize) {
    var buffers = new Queue();
    var lowLimit = .2;

    function fillBuffers(size) {
        //notifyObserver();
        const sz = size || minBuffers;
        if (buffers.length < Math.floor(minBuffers * lowLimit)) {
            for (var i = buffers.length; i < sz; i++) {
                generateOneBuffer(null);
            }
        }
    }

    fillBuffers();

    function generateOneBuffer(b) {
        if (!b) {
            b = PSKBuffer.alloc(0);
        }
        const sz = buffersSize - b.length;
        /*crypto.randomBytes(sz, function (err, res) {
            buffers.push(Buffer.concat([res, b]));
            notifyObserver();
        });*/
        buffers.push(PSKBuffer.concat([crypto.randomBytes(sz), b]));
        notifyObserver();
    }

    function extractN(n) {
        var sz = Math.floor(n / buffersSize);
        var ret = [];

        for (var i = 0; i < sz; i++) {
            ret.push(buffers.pop());
            setTimeout(generateOneBuffer, 1);
        }


        var remainder = n % buffersSize;
        if (remainder > 0) {
            var front = buffers.pop();
            ret.push(front.slice(0, remainder));
            //generateOneBuffer(front.slice(remainder));
            setTimeout(function () {
                generateOneBuffer(front.slice(remainder));
            }, 1);
        }

        //setTimeout(fillBuffers, 1);

        return Buffer.concat(ret);
    }

    var fillInProgress = false;

    this.generateUid = function (n) {
        var totalSize = buffers.length * buffersSize;
        if (n <= totalSize) {
            return extractN(n);
        } else {
            if (!fillInProgress) {
                fillInProgress = true;
                setTimeout(function () {
                    fillBuffers(Math.floor(minBuffers * 2.5));
                    fillInProgress = false;
                }, 1);
            }
            return crypto.randomBytes(n);
        }
    };

    var observer;
    this.registerObserver = function (obs) {
        if (observer) {
            console.error(new Error("One observer allowed!"));
        } else {
            if (typeof obs == "function") {
                observer = obs;
                //notifyObserver();
            }
        }
    };

    function notifyObserver() {
        if (observer) {
            var valueToReport = buffers.length * buffersSize;
            setTimeout(function () {
                observer(null, {"size": valueToReport});
            }, 10);
        }
    }
}

module.exports.createUidGenerator = function (minBuffers, bufferSize) {
    return new UidGenerator(minBuffers, bufferSize);
};

}).call(this,require("buffer").Buffer)

},{"./Queue":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\Queue.js","buffer":false,"crypto":false}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\is-buffer\\index.js":[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\array-set.js":[function(require,module,exports){
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

},{"buffer":false}],"dossier":[function(require,module,exports){
const se = require("swarm-engine");
if(typeof $$ === "undefined" || typeof $$.swarmEngine === "undefined"){
    se.initialise();
}

module.exports.load = function(seed, identity, callback){
    const pathName = "path";
    const path = require(pathName);
    const powerCord = new se.OuterThreadPowerCord(path.join(process.env.PSK_ROOT_INSTALATION_FOLDER, "psknode/bundles/threadBoot.js"), false, seed);

    let cord_identity;
    try{
        const crypto = require("pskcrypto");
        cord_identity = crypto.pskHash(seed, "hex");
        $$.swarmEngine.plug(cord_identity, powerCord);
    }catch(err){
        return callback(err);
    }
    $$.interactions.startSwarmAs(cord_identity, "transactionHandler", "start", identity, "TooShortBlockChainWorkaroundDeleteThis", "add").onReturn(err => {
        if (err) {
            return callback(err);
        }

        const handler = {
            attachTo : $$.interactions.attachTo,
            startTransaction : function (transactionTypeName, methodName, ...args) {
                //todo: get identity from context somehow
                return $$.interactions.startSwarmAs(cord_identity, "transactionHandler", "start", identity, transactionTypeName, methodName, ...args);
            }
        };
        //todo implement a way to know when thread is ready
        setTimeout(()=>{
            callback(undefined, handler);
        }, 100);
    });
};
},{"pskcrypto":"pskcrypto","swarm-engine":"swarm-engine"}],"double-check":[function(require,module,exports){
/**
 * Generic function used to registers methods such as asserts, logging, etc. on the current context.
 * @param name {String)} - name of the method (use case) to be registered.
 * @param func {Function} - handler to be invoked.
 * @param paramsDescription {Object} - parameters descriptions
 * @param after {Function} - callback function to be called after the function has been executed.
 */
function addUseCase(name, func, paramsDescription, after) {
    var newFunc = func;
    if (typeof after === "function") {
        newFunc = function () {
            const args = Array.from(arguments);
            func.apply(this, args);
            after();
        };
    }

    // some properties should not be overridden
    const protectedProperties = ['addCheck', 'addCase', 'register'];
    if (protectedProperties.indexOf(name) === -1) {
        this[name] = newFunc;
    } else {
        throw new Error('Cant overwrite ' + name);
    }

    if (paramsDescription) {
        this.params[name] = paramsDescription;
    }
}

/**
 * Creates an alias to an existing function.
 * @param name1 {String} - New function name.
 * @param name2 {String} - Existing function name.
 */
function alias(name1, name2) {
    this[name1] = this[name2];
}

/**
 * Singleton for adding various functions for use cases regarding logging.
 * @constructor
 */
function LogsCore() {
    this.params = {};
}

/**
 * Singleton for adding your various functions for asserts.
 * @constructor
 */
function AssertCore() {
    this.params = {};
}

/**
 * Singleton for adding your various functions for checks.
 * @constructor
 */
function CheckCore() {
    this.params = {};
}

/**
 * Singleton for adding your various functions for generating exceptions.
 * @constructor
 */
function ExceptionsCore() {
    this.params = {};
}

/**
 * Singleton for adding your various functions for running tests.
 * @constructor
 */
function TestRunnerCore() {
}

LogsCore.prototype.addCase = addUseCase;
AssertCore.prototype.addCheck = addUseCase;
CheckCore.prototype.addCheck = addUseCase;
ExceptionsCore.prototype.register = addUseCase;

LogsCore.prototype.alias = alias;
AssertCore.prototype.alias = alias;
CheckCore.prototype.alias = alias;
ExceptionsCore.prototype.alias = alias;

// Create modules
var assertObj = new AssertCore();
var checkObj = new CheckCore();
var exceptionsObj = new ExceptionsCore();
var loggerObj = new LogsCore();
var testRunnerObj = new TestRunnerCore();

// Export modules
exports.assert = assertObj;
exports.check = checkObj;
exports.exceptions = exceptionsObj;
exports.logger = loggerObj;
exports.testRunner = testRunnerObj;

// Initialise modules
require("./standardAsserts.js").init(exports, loggerObj);
require("./standardLogs.js").init(exports);
require("./standardExceptions.js").init(exports);
require("./standardChecks.js").init(exports);
require("./runner.js").init(exports);

// Global Uncaught Exception handler.
if (process.on) {
    process.on('uncaughtException', function (err) {
        if (typeof err.isFailedAssert == "undefined") {
            exports.logger.record({
                level: 0,
                message: "double-check has intercepted an uncaught exception",
                stack: err.stack
            });
            exports.assert.forceFailedTest("Uncaught Exception!", err);
        }
    });
}


const fs = require('fs');
const crypto = require('crypto');
const AsyncDispatcher = require('../utils/AsyncDispatcher');
const path = require('path');

function ensureFolderHierarchy(folders, callback) {
    const asyncDispatcher = new AsyncDispatcher(() => {
        callback();
    });

    if (folders.length === 0) {
        return callback();
    }

    asyncDispatcher.dispatchEmpty(folders.length);
    folders.forEach(folder => {
        fs.access(folder, (err) => {
            if (err) {
                fs.mkdir(folder, {recursive: true}, (err) => {
                    if (err) {
                        return callback(err);
                    }

                    asyncDispatcher.markOneAsFinished();
                });
            } else {
                asyncDispatcher.markOneAsFinished();
            }
        });
    });

}

function ensureFilesExist(folders, files, text, callback) {
    if (!Array.isArray(folders)) {
        folders = [folders];
    }

    if (!Array.isArray(files)) {
        files = [files];
    }

    ensureFolderHierarchy(folders, (err) => {
        if (err) {
            return callback(err);
        }

        if (files.length === 0) {
            return callback();
        }

        files.forEach((file, i) => {
            const stream = fs.createWriteStream(file);
            stream.write(text[i]);
            if (i === files.length - 1) {
                return callback();
            }
        });
    });
}


function computeFileHash(filePath, callback) {
    const readStream = fs.createReadStream(filePath);
    const hash = crypto.createHash("sha256");
    readStream.on("data", (data) => {
        hash.update(data);
    });

    readStream.on("close", () => {
        callback(undefined, hash.digest("hex"));
    });
}

function computeFoldersHashes(folders, callback) {
    if (!Array.isArray(folders)) {
        folders = [folders];
    }

    if (folders.length === 0) {
        return callback();
    }

    let hashes = [];
    const asyncDispatcher = new AsyncDispatcher(() => {
        callback(undefined, hashes);
    });

    asyncDispatcher.dispatchEmpty(folders.length);
    folders.forEach(folder => {
        __computeHashRecursively(folder, hashes, (err, hashList) => {
            if (err) {
                return callback(err);
            }

            hashes = hashes.concat(hashList);
            asyncDispatcher.markOneAsFinished();
        });
    });
}

function __computeHashRecursively(folderPath, hashes = [], callback) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return callback(err);
        }

        if (files.length === 0) {
            return callback(undefined, hashes);
        }

        const asyncDispatcher = new AsyncDispatcher(() => {
            callback(undefined, hashes);
        });

        asyncDispatcher.dispatchEmpty(files.length);
        files.forEach(file => {
            const tempPath = path.join(folderPath, file);
            fs.stat(tempPath, (err, stats) => {
                if (err) {
                    return callback(err);
                }

                if (stats.isFile()) {
                    computeFileHash(tempPath, (err, fileHash) => {
                        if (err) {
                            return callback(err);
                        }

                        hashes.push(fileHash);
                        asyncDispatcher.markOneAsFinished();
                    });
                } else {
                    __computeHashRecursively(tempPath, hashes, (err) => {
                        if (err) {
                            return callback(err);
                        }
                        asyncDispatcher.markOneAsFinished();
                    });
                }
            });
        });
    });
}

function deleteFolderRecursive(folderPath) {
    if (fs.existsSync(folderPath)) {
        fs.rmdirSync(folderPath, {recursive: true});
    }
}



function deleteFoldersSync(folders) {
    if (!Array.isArray(folders)) {
        folders = [folders];
    }

    if (folders.length === 0) {
        return;
    }

    folders.forEach(folder => {
        deleteFolderRecursive(folder);
    });
}

function createTestFolder(prefix, cllback) {
    const os = require("os");
    fs.mkdtemp(path.join(os.tmpdir(), prefix), function (err, res) {
        const cleanFolder = function () {
            deleteFolderRecursive(res);
        };
        exports.assert.addCleaningFunction(cleanFolder);
        cllback(err, res);
    });
}

Object.assign(module.exports, {
    deleteFolderRecursive,
    createTestFolder,
    computeFoldersHashes,
    computeFileHash,
    ensureFilesExist,
    deleteFoldersSync
});

},{"../utils/AsyncDispatcher":"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\utils\\AsyncDispatcher.js","./runner.js":"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\runner.js","./standardAsserts.js":"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\standardAsserts.js","./standardChecks.js":"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\standardChecks.js","./standardExceptions.js":"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\standardExceptions.js","./standardLogs.js":"D:\\Catalin\\Munca\\privatesky\\modules\\double-check\\lib\\standardLogs.js","crypto":false,"fs":false,"os":false,"path":false}],"edfs":[function(require,module,exports){
require("./brickTransportStrategies/brickTransportStrategiesRegistry");
const constants = require("./moduleConstants");

function generateUniqueStrategyName(prefix) {
    const randomPart = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    return prefix + "_" + randomPart;
}

const or = require("overwrite-require");
const browserContexts = [or.constants.SERVICE_WORKER_ENVIRONMENT_TYPE];
if (browserContexts.indexOf($$.environmentType) !== -1) {
    $$.brickTransportStrategiesRegistry.add("http", require("./brickTransportStrategies/FetchBrickTransportStrategy"));
}else{
    $$.brickTransportStrategiesRegistry.add("http", require("./brickTransportStrategies/HTTPBrickTransportStrategy"));
}

module.exports = {
    attachToEndpoint(endpoint) {
        const EDFS = require("./lib/EDFS");
        return new EDFS(endpoint);
    },
    attachWithSeed(compactSeed) {
        const SEED = require("bar").Seed;
        const seed = new SEED(compactSeed);
        return this.attachToEndpoint(seed.getEndpoint());
    },
    attachWithPin(pin, callback) {
        require("./seedCage").getSeed(pin, (err, seed) => {
            if (err) {
                return callback(err);
            }

            let edfs;
            try {
                edfs = this.attachWithSeed(seed);
            } catch (e) {
                return callback(e);
            }

            callback(undefined, edfs);
        });
    },
    checkForSeedCage(callback) {
        require("./seedCage").check(callback);
    },
    constants: constants
};
},{"./brickTransportStrategies/FetchBrickTransportStrategy":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\brickTransportStrategies\\FetchBrickTransportStrategy.js","./brickTransportStrategies/HTTPBrickTransportStrategy":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\brickTransportStrategies\\HTTPBrickTransportStrategy.js","./brickTransportStrategies/brickTransportStrategiesRegistry":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\brickTransportStrategies\\brickTransportStrategiesRegistry.js","./lib/EDFS":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\lib\\EDFS.js","./moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\moduleConstants.js","./seedCage":"D:\\Catalin\\Munca\\privatesky\\modules\\edfs\\seedCage\\index.js","bar":false,"overwrite-require":"overwrite-require"}],"overwrite-require":[function(require,module,exports){
(function (global){
/*
 require and $$.require are overwriting the node.js defaults in loading modules for increasing security, speed and making it work to the privatesky runtime build with browserify.
 The privatesky code for domains should work in node and browsers.
 */
function enableForEnvironment(envType){

    const moduleConstants = require("./moduleConstants");

    /**
     * Used to provide autocomplete for $$ variables
     * @classdesc Interface for $$ object
     *
     * @name $$
     * @class
     *
     */

    switch (envType) {
        case moduleConstants.BROWSER_ENVIRONMENT_TYPE :
            global = window;
            break;
        case moduleConstants.SERVICE_WORKER_ENVIRONMENT_TYPE:
            global = self;
            break;
    }

    if (typeof(global.$$) == "undefined") {
        /**
         * Used to provide autocomplete for $$ variables
         * @type {$$}
         */
        global.$$ = {};
    }

    if (typeof($$.__global) == "undefined") {
        $$.__global = {};
    }

    Object.defineProperty($$, "environmentType", {
        get: function(){
            return envType;
        },
        set: function (value) {
            throw Error("Environment type already set!");
        }
    });


    if (typeof($$.__global.requireLibrariesNames) == "undefined") {
        $$.__global.currentLibraryName = null;
        $$.__global.requireLibrariesNames = {};
    }


    if (typeof($$.__runtimeModules) == "undefined") {
        $$.__runtimeModules = {};
    }


    if (typeof(global.functionUndefined) == "undefined") {
        global.functionUndefined = function () {
            console.log("Called of an undefined function!!!!");
            throw new Error("Called of an undefined function");
        };
        if (typeof(global.webshimsRequire) == "undefined") {
            global.webshimsRequire = global.functionUndefined;
        }

        if (typeof(global.domainRequire) == "undefined") {
            global.domainRequire = global.functionUndefined;
        }

        if (typeof(global.pskruntimeRequire) == "undefined") {
            global.pskruntimeRequire = global.functionUndefined;
        }
    }

    const pastRequests = {};

    function preventRecursiveRequire(request) {
        if (pastRequests[request]) {
            const err = new Error("Preventing recursive require for " + request);
            err.type = "PSKIgnorableError";
            throw err;
        }

    }

    function disableRequire(request) {
        pastRequests[request] = true;
    }

    function enableRequire(request) {
        pastRequests[request] = false;
    }

    function requireFromCache(request) {
        const existingModule = $$.__runtimeModules[request];
        return existingModule;
    }

    function wrapStep(callbackName) {
        const callback = global[callbackName];

        if (callback === undefined) {
            return null;
        }

        if (callback === global.functionUndefined) {
            return null;
        }

        return function (request) {
            const result = callback(request);
            $$.__runtimeModules[request] = result;
            return result;
        }
    }


    function tryRequireSequence(originalRequire, request) {
        let arr;
        if (originalRequire) {
            arr = $$.__requireFunctionsChain.slice();
            arr.push(originalRequire);
        } else {
            arr = $$.__requireFunctionsChain;
        }

        preventRecursiveRequire(request);
        disableRequire(request);
        let result;
        const previousRequire = $$.__global.currentLibraryName;
        let previousRequireChanged = false;

        if (!previousRequire) {
            // console.log("Loading library for require", request);
            $$.__global.currentLibraryName = request;

            if (typeof $$.__global.requireLibrariesNames[request] == "undefined") {
                $$.__global.requireLibrariesNames[request] = {};
                //$$.__global.requireLibrariesDescriptions[request]   = {};
            }
            previousRequireChanged = true;
        }
        for (let i = 0; i < arr.length; i++) {
            const func = arr[i];
            try {

                if (func === global.functionUndefined) continue;
                result = func(request);

                if (result) {
                    break;
                }

            } catch (err) {
                if (err.type !== "PSKIgnorableError") {
                    $$.err("Require encountered an error while loading ", request, "\nCause:\n", err.stack);
                }
            }
        }

        if (!result) {
            $$.log("Failed to load module ", request, result);
        }

        enableRequire(request);
        if (previousRequireChanged) {
            //console.log("End loading library for require", request, $$.__global.requireLibrariesNames[request]);
            $$.__global.currentLibraryName = null;
        }
        return result;
    }

    function makeBrowserRequire(){
        console.log("Defining global require in browser");


        global.require = function (request) {

            ///*[requireFromCache, wrapStep(webshimsRequire), , wrapStep(pskruntimeRequire), wrapStep(domainRequire)*]
            return tryRequireSequence(null, request);
        }
    }

    function makeIsolateRequire(){
        // require should be provided when code is loaded in browserify
        const bundleRequire = require;

        $$.requireBundle('sandboxBase');
        // this should be set up by sandbox prior to
        const sandboxRequire = global.require;
        const cryptoModuleName = 'crypto';
        global.crypto = require(cryptoModuleName);

        function newLoader(request) {
            // console.log("newLoader:", request);
            //preventRecursiveRequire(request);
            const self = this;

            // console.log('trying to load ', request);

            function tryBundleRequire(...args) {
                //return $$.__originalRequire.apply(self,args);
                //return Module._load.apply(self,args)
                let res;
                try {
                    res = sandboxRequire.apply(self, args);
                } catch (err) {
                    if (err.code === "MODULE_NOT_FOUND") {
                        const p = path.join(process.cwd(), request);
                        res = sandboxRequire.apply(self, [p]);
                        request = p;
                    } else {
                        throw err;
                    }
                }
                return res;
            }

            let res;


            res = tryRequireSequence(tryBundleRequire, request);


            return res;
        }

        global.require = newLoader;
    }

    function makeNodeJSRequire(){
        const pathModuleName = 'path';
        const path = require(pathModuleName);
        const cryptoModuleName = 'crypto';
        const utilModuleName = 'util';
        $$.__runtimeModules["crypto"] = require(cryptoModuleName);
        $$.__runtimeModules["util"] = require(utilModuleName);

        const moduleModuleName = 'module';
        const Module = require(moduleModuleName);
        $$.__runtimeModules["module"] = Module;

        console.log("Redefining require for node");

        $$.__originalRequire = Module._load;
        const moduleOriginalRequire = Module.prototype.require;

        function newLoader(request) {
            // console.log("newLoader:", request);
            //preventRecursiveRequire(request);
            const self = this;

            function originalRequire(...args) {
                //return $$.__originalRequire.apply(self,args);
                //return Module._load.apply(self,args)
                let res;
                try {
                    res = moduleOriginalRequire.apply(self, args);
                } catch (err) {
                    if (err.code === "MODULE_NOT_FOUND") {
                        let pathOrName = request;
                        if(pathOrName.startsWith('/') || pathOrName.startsWith('./') || pathOrName.startsWith('../')){
                            pathOrName = path.join(process.cwd(), request);
                        }
                        res = moduleOriginalRequire.call(self, pathOrName);
                        request = pathOrName;
                    } else {
                        throw err;
                    }
                }
                return res;
            }

            function currentFolderRequire(request) {
                return
            }

            //[requireFromCache, wrapStep(pskruntimeRequire), wrapStep(domainRequire), originalRequire]
            return tryRequireSequence(originalRequire, request);
        }

        Module.prototype.require = newLoader;
        return newLoader;
    }

    require("./standardGlobalSymbols.js");

    if (typeof($$.require) == "undefined") {

        $$.__requireList = ["webshimsRequire"];
        $$.__requireFunctionsChain = [];

        $$.requireBundle = function (name) {
            name += "Require";
            $$.__requireList.push(name);
            const arr = [requireFromCache];
            $$.__requireList.forEach(function (item) {
                const callback = wrapStep(item);
                if (callback) {
                    arr.push(callback);
                }
            });

            $$.__requireFunctionsChain = arr;
        };

        $$.requireBundle("init");

        switch ($$.environmentType) {
            case moduleConstants.BROWSER_ENVIRONMENT_TYPE:
                makeBrowserRequire();
                $$.require = require;
                break;
            case moduleConstants.SERVICE_WORKER_ENVIRONMENT_TYPE:
                makeBrowserRequire();
                $$.require = require;
                break;
            case moduleConstants.ISOLATE_ENVIRONMENT_TYPE:
                makeIsolateRequire();
                $$.require = require;
                break;
            default:
               $$.require = makeNodeJSRequire();
        }

    }
};



module.exports = {
    enableForEnvironment,
    constants: require("./moduleConstants")
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./moduleConstants":"D:\\Catalin\\Munca\\privatesky\\modules\\overwrite-require\\moduleConstants.js","./standardGlobalSymbols.js":"D:\\Catalin\\Munca\\privatesky\\modules\\overwrite-require\\standardGlobalSymbols.js"}],"pskcrypto":[function(require,module,exports){
const PskCrypto = require("./lib/PskCrypto");
const ssutil = require("./signsensusDS/ssutil");

module.exports = PskCrypto;

module.exports.hashValues = ssutil.hashValues;

module.exports.DuplexStream = require("./lib/utils/DuplexStream");

module.exports.isStream = require("./lib/utils/isStream");
},{"./lib/PskCrypto":"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\PskCrypto.js","./lib/utils/DuplexStream":"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\utils\\DuplexStream.js","./lib/utils/isStream":"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\lib\\utils\\isStream.js","./signsensusDS/ssutil":"D:\\Catalin\\Munca\\privatesky\\modules\\pskcrypto\\signsensusDS\\ssutil.js"}],"soundpubsub":[function(require,module,exports){
module.exports = {
					soundPubSub: require("./lib/soundPubSub").soundPubSub
};
},{"./lib/soundPubSub":"D:\\Catalin\\Munca\\privatesky\\modules\\soundpubsub\\lib\\soundPubSub.js"}],"source-map-support":[function(require,module,exports){
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

},{"./lib/source-map-consumer":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-map-consumer.js","./lib/source-map-generator":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-map-generator.js","./lib/source-node":"D:\\Catalin\\Munca\\privatesky\\node_modules\\source-map\\lib\\source-node.js"}],"swarm-engine":[function(require,module,exports){
module.exports = {
    initialise:function(...args){
        if(typeof $$.swarmEngine === "undefined"){
            const SwarmEngine = require('./SwarmEngine');
            $$.swarmEngine = new SwarmEngine(...args);
        }else{
            $$.throw("Swarm engine already initialized!");
        }
    },
    OuterIsolatePowerCord: require("./powerCords/OuterIsolatePowerCord"),
    InnerIsolatePowerCord: require("./powerCords/InnerIsolatePowerCord"),
    OuterThreadPowerCord: require("./powerCords/OuterThreadPowerCord"),
    InnerThreadPowerCord: require("./powerCords/InnerThreadPowerCord"),
    RemoteChannelPairPowerCord: require("./powerCords/RemoteChannelPairPowerCord"),
    RemoteChannelPowerCord: require("./powerCords/RemoteChannelPowerCord"),
    SmartRemoteChannelPowerCord:require("./powerCords/SmartRemoteChannelPowerCord"),
    BootScripts: require('./bootScripts')
};

const or = require("overwrite-require");
const browserContexts = [or.constants.BROWSER_ENVIRONMENT_TYPE, or.constants.SERVICE_WORKER_ENVIRONMENT_TYPE];
if (browserContexts.indexOf($$.environmentType) !== -1) {
    module.exports.IframePowerCord = require("./powerCords/browser/IframePowerCord");
    module.exports.HostPowerCord = require("./powerCords/browser/HostPowerCord");
}
},{"./SwarmEngine":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\SwarmEngine.js","./bootScripts":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\bootScripts\\index.js","./powerCords/InnerIsolatePowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\InnerIsolatePowerCord.js","./powerCords/InnerThreadPowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\InnerThreadPowerCord.js","./powerCords/OuterIsolatePowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\OuterIsolatePowerCord.js","./powerCords/OuterThreadPowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\OuterThreadPowerCord.js","./powerCords/RemoteChannelPairPowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\RemoteChannelPairPowerCord.js","./powerCords/RemoteChannelPowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\RemoteChannelPowerCord.js","./powerCords/SmartRemoteChannelPowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\SmartRemoteChannelPowerCord.js","./powerCords/browser/HostPowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\browser\\HostPowerCord.js","./powerCords/browser/IframePowerCord":"D:\\Catalin\\Munca\\privatesky\\modules\\swarm-engine\\powerCords\\browser\\IframePowerCord.js","overwrite-require":"overwrite-require"}],"swarmutils":[function(require,module,exports){
(function (global){
module.exports.OwM = require("./lib/OwM");
module.exports.beesHealer = require("./lib/beesHealer");

const uidGenerator = require("./lib/uidGenerator").createUidGenerator(200, 32);

module.exports.safe_uuid = require("./lib/safe-uuid").init(uidGenerator);

module.exports.Queue = require("./lib/Queue");
module.exports.combos = require("./lib/Combos");

module.exports.uidGenerator = uidGenerator;
module.exports.generateUid = uidGenerator.generateUid;
module.exports.TaskCounter = require("./lib/TaskCounter");
module.exports.SwarmPacker = require("./lib/SwarmPacker");

module.exports.createPskConsole = function () {
  return require('./lib/pskconsole');
};

module.exports.pingPongFork = require('./lib/pingpongFork');


if(typeof global.$$ == "undefined"){
  global.$$ = {};
}

if(typeof global.$$.uidGenerator == "undefined"){
    $$.uidGenerator = module.exports.safe_uuid;
}

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./lib/Combos":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\Combos.js","./lib/OwM":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\OwM.js","./lib/Queue":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\Queue.js","./lib/SwarmPacker":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\SwarmPacker.js","./lib/TaskCounter":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\TaskCounter.js","./lib/beesHealer":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\beesHealer.js","./lib/pingpongFork":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\pingpongFork.js","./lib/pskconsole":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\pskconsole.js","./lib/safe-uuid":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\safe-uuid.js","./lib/uidGenerator":"D:\\Catalin\\Munca\\privatesky\\modules\\swarmutils\\lib\\uidGenerator.js"}]},{},["D:\\Catalin\\Munca\\privatesky\\builds\\tmp\\testsRuntime.js"])
//# sourceMappingURL=testsRuntime.js.map