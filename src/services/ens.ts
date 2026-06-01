import { createPublicClient, http, toCoinType } from 'viem';
import { base, mainnet } from 'viem/chains';
import { normalize } from 'viem/ens';

// Create a public client for Ethereum mainnet
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

/**
 * Resolve ENS name for an Ethereum address
 * Returns the ENS name if found, otherwise returns null
 */
export async function resolveENS(address: string): Promise<string | null> {
  try {
    // Only attempt ENS resolution for Ethereum addresses
    if (!address.startsWith('0x') || address.length !== 42) {
      return null;
    }

    const ensName = await publicClient.getEnsName({
      address: address as `0x${string}`,
    });
    if (ensName) {
      return ensName;
    }

    return await publicClient.getEnsName({
      address: address as `0x${string}`,
      coinType: toCoinType(base.id),
    });
  } catch (error) {
    console.error('Failed to resolve ENS:', error);
    return null;
  }
}

/**
 * Resolve ENS name to address
 * Returns the address if ENS name is valid, otherwise returns null
 */
export async function resolveENSToAddress(ensName: string): Promise<string | null> {
  try {
    const normalizedName = normalize(ensName);
    const address = await publicClient.getEnsAddress({
      name: normalizedName,
    });
    if (address) {
      return address;
    }

    // Only fall back to the Base coin type record for Base names
    // (e.g. `name.base.eth`). For generic `.eth` names, the ETH (coinType 60)
    // record and the Base record can resolve to different addresses, so we
    // avoid silently returning a different chain's address.
    if (!normalizedName.endsWith('.base.eth')) {
      return null;
    }

    return await publicClient.getEnsAddress({
      name: normalizedName,
      coinType: toCoinType(base.id),
    });
  } catch (error) {
    console.error('Failed to resolve ENS to address:', error);
    return null;
  }
}
