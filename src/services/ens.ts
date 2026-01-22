import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
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

    return ensName;
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
    const address = await publicClient.getEnsAddress({
      name: normalize(ensName),
    });

    return address;
  } catch (error) {
    console.error('Failed to resolve ENS to address:', error);
    return null;
  }
}
