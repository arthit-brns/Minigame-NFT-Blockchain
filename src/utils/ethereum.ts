import { ethers } from "ethers";
import { CONTRACT_ADDRESS, WEAPON_ABI } from "../contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface Weapon {
  itemName: string;
  description: string;
  image: string;
  isUsed: boolean;
  owner: string;
}

export const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Check network, we want 31337 (Localhost)
      const network = await provider.getNetwork();
      if (network.chainId !== 31337n) {
          try {
              await window.ethereum.request({
                  method: 'wallet_switchEthereumChain',
                  params: [{ chainId: '0x7A69' }], // 31337 in hex
              });
          } catch (switchError: any) {
              // This error code indicates that the chain has not been added to MetaMask.
              if (switchError.code === 4902) {
                  await window.ethereum.request({
                      method: 'wallet_addEthereumChain',
                      params: [
                          {
                              chainId: '0x7A69',
                              chainName: 'Localhost 8545',
                              rpcUrls: ['http://127.0.0.1:8545'],
                          },
                      ],
                  });
              }
          }
      }

      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      return { provider, signer, address };
    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  } else {
    throw new Error("Please install MetaMask!");
  }
};

export const getContract = (signerOrProvider: ethers.Signer | ethers.Provider) => {
  return new ethers.Contract(CONTRACT_ADDRESS, WEAPON_ABI, signerOrProvider);
};

export const mintWeapon = async (signer: ethers.Signer, to: string, itemName: string, description: string, image: string) => {
  const contract = getContract(signer);
  try {
    const tx = await contract.mintWeapon(to, itemName, description, image);
    await tx.wait();
    return true;
  } catch (error) {
    console.error("Minting failed:", error);
    throw error;
  }
};

export const getMyWeapons = async (signer: ethers.Signer): Promise<Weapon[]> => {
  const contract = getContract(signer);
  try {
    const weapons = await contract.getMyWeapons();
    return weapons.map((w: any) => ({
      itemName: w.itemName,
      description: w.description,
      image: w.image,
      isUsed: w.isUsed,
      owner: w.owner
    }));
  } catch (error) {
    console.error("Failed to fetch weapons:", error);
    return [];
  }
};
