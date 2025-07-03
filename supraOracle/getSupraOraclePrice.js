const PullServiceClient = require("./pullServiceClient");
const { ethers } = require("ethers");

const ORACLE_PROOF_ABI =
	"tuple(tuple(uint64 committee_id,bytes32 root,uint256[2] sigs,tuple(tuple(uint32 pair,uint128 price,uint64 timestamp,uint16 decimals,uint64 round)[] committee_feed,bytes32[] proof,bool[] flags) committee_data)[] data)";

async function getProofs() {
	const address = "https://rpc-testnet-dora-2.supra.com";
	const pairIndexes = [1];
	const chainType = "evm";

	const client = new PullServiceClient(address);

	const request = {
		pair_indexes: pairIndexes,
		chain_type: chainType,
	};
	console.log("Requesting proof for price index : ", request.pair_indexes);
	try {
		const response = await client.getProof(request);
		console.log("Proof received:", response);
		return response;
	} catch (error) {
		console.error("Error in getProofs:", error);
		// throw error;
	}

}

const deserializeProofBytes = (proofHex) => {
	const abiCoder = ethers.AbiCoder.defaultAbiCoder();

	const [proofData] = abiCoder.decode([ORACLE_PROOF_ABI], proofHex);

	const pairId = [];
	const pairPrice = [];
	const pairDecimal = [];
	const pairTimestamp = [];

	for (let i = 0; i < proofData.data.length; ++i) {
		const committeeFeed = proofData.data[i].committee_data.committee_feed;
		for (let j = 0; j < committeeFeed.length; ++j) {
			pairId.push(committeeFeed[j].pair.toString());
			pairPrice.push(committeeFeed[j].price.toString());
			pairDecimal.push(committeeFeed[j].decimals.toString());
			pairTimestamp.push(committeeFeed[j].timestamp.toString());
		}
	}

	console.log("Pair index : ", pairId);
	console.log("Pair Price : ", pairPrice);
	console.log("Pair Decimal : ", pairDecimal);
	console.log("Pair Timestamp : ", pairTimestamp);
	return {
		pairId: pairId[0],
		pairPrice: pairPrice[0],
		pairDecimal: pairDecimal[0],
		pairTimestamp: pairTimestamp[0],
	};
};

module.exports.getSupraOraclePrice = async () => {
	try {
		const proofs = await getProofs();
		const bytesLike = "0x" + proofs.proof_bytes;

		const hex = ethers.hexlify(bytesLike);
		// console.log({hex})
		return deserializeProofBytes(hex);
	} catch (error) {
		console.error("Error in main:", error);
	}
};
module.exports.getBytesProof = async () => {
	try {
		const proofs = await getProofs();

		const hex = ethers.hexlify(proofs.evm.proof_bytes);
		return hex;
	} catch (error) {
		console.error("Error in main:", error);
	}
};

