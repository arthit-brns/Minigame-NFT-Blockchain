export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

export const WEAPON_ABI = [
  "function mintWeapon(address to, string memory itemName, string memory description, string memory image) public",
  "function getMyWeapons() public view returns (tuple(string itemName, string description, string image, bool isUsed, address owner)[])",
  "function useWeapon(uint256 tokenId) public",
  "function markAsUsed(uint256 tokenId) public"
];
