import walletconnect from "../assets/walletconnect.png";

import { useAddress, useConnectionStatus } from "@thirdweb-dev/react";

import { TokenPopUp } from "../Components/TokenPopUp";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import PathFinder from "../Components/pathFinder";
import debounce from "../Components/debounce";
import { TokenList, poolAddress } from "../Components/constants";
import {
  Factory_address,
  factoryABi,
  nftManagerABi,
  Manager_address,
  managerABi,
  Pool_Address,
  v3PoolAbi,
  NFTManager_address,
  quoterAbi,
  Quoter_address,
} from "../Components/testConstant";

export const TestNet = () => {
  //State Variables

  const [isTokenOpen, setIsTokenOpen] = useState(false);
  const status = useConnectionStatus();
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const address = useAddress();
  const [selectedToken, setSelectedToken] = useState("Select a token");
  const [selectedToken2, setSelectedToken2] = useState("Select a token");
  const [SelectedTokenImage, setSelectedTokenImage] = useState(null);
  const [SelectedTokenImage2, setSelectedTokenImage2] = useState(null);
  const [token1address, settoken1address] = useState(null);
  const [token2address, settoken2address] = useState(null);
  const [tokenAbi, setTokenAbi] = useState({});
  const [tokenAbi2, setTokenAbi2] = useState({});
  const [pageChainId, setPageChainId] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchQuery2, setSearchQuery2] = useState("");
  const [slippage, setSlippage] = useState(0.1);
  const [path, setPath] = useState();
  const [pathFinder, setPathFinder] = useState();

  // const [isApproved, setIsApproved] = useState(true);

  const [amount, setAmount] = useState(0);
  const [amount2, setAmount2] = useState(0);

  const pairsToTokens = (pairs) => {
    const tokens = pairs.reduce((acc, pair) => {
      acc[pair.token0.address] = {
        symbol: pair.token0.symbol,
        address: pair.token0.address,
        selected: false,
      };
      acc[pair.token1.address] = {
        symbol: pair.token1.symbol,
        address: pair.token1.address,
        selected: false,
      };

      return acc;
    }, {});

    return Object.keys(tokens).map((k) => tokens[k]);
  };

  const handleSubmitForm = (formData) => {
    setIsTokenOpen(false);
  };

  const handleTokenSelect = async (token) => {
    setTokenAbi(token.abi);
    setSelectedToken(token.name);
    settoken1address(token.address);
    setSelectedTokenImage(token.img);
  };

  const handleTokenSelect2 = async (token) => {
    setTokenAbi2(token.abi);
    setSelectedToken2(token.name);
    settoken2address(token.address);
    setSelectedTokenImage2(token.img);
  };

  const filteredTokens = TokenList.filter((token) =>
    token.ticker.toUpperCase().includes(searchQuery.toUpperCase())
  );

  const filteredTokens2 = TokenList.filter((token) =>
    token.ticker.toUpperCase().includes(searchQuery2.toUpperCase())
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleSearch2 = (query) => {
    setSearchQuery2(query);
  };

  const changeChainID = async () => {
    if (status === "connected") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const chainId = await signer.getChainId();
      setPageChainId(chainId);
      if (chainId !== 0x13881) {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: "0x13881",
            },
          ],
        });
      }
    }
  };

  const countPathTokens = (path) => (path.length - 1) / 2 + 1;

  const pathToTypes = (path) => {
    return ["address"].concat(
      new Array(countPathTokens(path) - 1).fill(["uint24", "address"]).flat()
    );
  };

  useEffect(() => {
    changeChainID();
  }, [pageChainId]);

  const swapToken = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      //Create Contract

      const token1Contract = new ethers.Contract(
        token1address,
        tokenAbi,
        signer
      );
      const token2Contract = new ethers.Contract(
        token2address,
        tokenAbi2,
        signer
      );
      const managerContract = new ethers.Contract(
        Manager_address,
        managerABi,
        signer
      );
      const amountIn = ethers.utils.parseUnits(amount).toString();
      const amountOut = ethers.utils.parseUnits(amount2);
      const minAmountOut = amountOut
        .mul((100 - parseFloat(slippage)) * 100)
        .div(10000);

      const packedPath = ethers.utils.solidityPack(pathToTypes(path), path);

      const params = {
        path: packedPath,
        recipient: address,
        amountIn: amountIn,
        minAmountOut: minAmountOut,
      };
      token1Contract.approve(Manager_address, amountIn);
      await managerContract.swap(params);
      alert("Swap Successful");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-column justify-center items-center ">
      {status === "undefined " ||
      status === "disconnected" ||
      status === "disconnected" ||
      status === "connecting" ? (
        <div className="flex items-center mt-32 justify-center m-5 mx-4 px-1 md:mx-16 rounded-lg transform transition-all duration-300 shadow-2xl shadow-cyan-400 hover:scale-105 mb-8">
          <div className="flex flex-col items-center m-5">
            <img
              src={walletconnect}
              alt="loading"
              className="w-60 h-60 object-cover rounded-full mb-4 transition-transform transform-gpu hover:scale-110"
            />
            <h1 className="text-3xl font-bold">Connect Wallet</h1>
            <h1 className="text-3xl font-bold">Use Mumbai Testnet</h1>
          </div>
        </div>
      ) : (
        <div className="flex  flex-col items-center mt-32 justify-center m-5 mx-4 px-1 md:mx-16 rounded-lg transform transition-all duration-300 shadow-2xl shadow-cyan-400">
          <div className="flex flex-col mb-5 items-center shadow-lg shadow-purple-950 backdrop-blur-lg bg-opacity-20 bg-white rounded-lg p-4">
            <h1 className="text-4xl font-bold mr-2 text-gray-600 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
              MUMBAI TESTNET
            </h1>
            <img
              src="https://cryptologos.cc/logos/polygon-matic-logo.svg?v=026" // Replace with your online logo image URL
              alt="Logo"
              className="w-8 h-10" // Adjust the width and height as needed
            />
          </div>

          <div className="w-full mb-5 max-w-md rounded-lg bg-gradient-to-br from-teal-500 via-yellow-500 to-red-500 bg-opacity-70 border border-gray-300 backdrop-blur-md shadow-2xl">
            <div
              className="p-4 flex items-center justify-between border-b"
              onClick={() => setOpenModal(!openModal)}
            >
              <div className="px-4 py-2 text-md font-bold cursor-pointer shadow-2xl mr-2 text-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400">
                <div className="flex flex-row items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:bg-gray-100">
                  <span className="text-xl font-bold text-gray-900 m-1">
                    {selectedToken}
                  </span>
                  {SelectedTokenImage != null && (
                    <img
                      src={SelectedTokenImage}
                      alt={`${selectedToken} Logo`}
                      className="w-12 h-12 mb-3 rounded-full"
                    />
                  )}
                </div>
              </div>

              <input
                type="number"
                onChange={(e) => {
                  setAmount(e.target.value);
                }}
                onClick={(e) => e.stopPropagation()}
                value={amount}
                className="flex-1 px-4 py-2 bg-opacity-70 bg-white border border-gray-300 backdrop-blur-md focus:ring-2 focus:ring-blue-400 rounded-lg transition duration-300 ease-in-out hover:shadow-md focus:outline-none focus:border-blue-400 text-gray-800"
                placeholder="Amount"
              />
            </div>
            <div className="p-4 flex items-center  justify-between">
              <div
                className="px-4 py-2 text-md font-bold cursor-pointer shadow-2xl mr-2 text-blue-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                onClick={() => setOpenModal2(!openModal2)}
              >
                <div className="flex flex-row items-center p-2 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:bg-gray-100">
                  <span className="text-xl font-bold text-gray-900 m-1">
                    {selectedToken2}
                  </span>
                  {SelectedTokenImage2 != null && (
                    <img
                      src={SelectedTokenImage2}
                      alt={`${selectedToken2} Logo`}
                      className="w-12 h-12 mb-3 rounded-full"
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col mb-5 items-center shadow-lg shadow-gray-950 backdrop-blur-lg bg-opacity-20 bg-white rounded-lg p-4">
                {/* <h1 className="text-lg font-bold mr-2 text-gray-600 bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                  Reserve :
                </h1>
                <h1 className="text-lg font-bold mr-2 text-gray-600 bg-clip-text text-transparent bg-gradient-to-r from-gray-700 to-gray-900">
                  Reserve :
                </h1> */}
                <input
                  type="number"
                  onChange={(e) => {
                    setAmount2(e.target.value);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  value={amount2}
                  className="flex-1 px-4 py-2 bg-opacity-70 bg-white border border-gray-300 backdrop-blur-md focus:ring-2 focus:ring-blue-400 rounded-lg transition duration-300 ease-in-out hover:shadow-md focus:outline-none focus:border-blue-400 text-gray-800"
                  placeholder="Amount"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-row space-x-14">
            <button className="button-86" role="button" onClick={swapToken}>
              Swap Token
            </button>

            <button
              className="button-87 "
              role="button"
              onClick={() => setIsTokenOpen(true)}
            >
              GET FREE TOKEN
            </button>
          </div>
        </div>
      )}
      {openModal && (
        <div
          className="fixed inset-0 z-50 bg-opacity-50 text-black font-bold flex items-center justify-center backdrop-blur-md"
          onClick={() => setOpenModal(!openModal)}
        >
          <div
            className="rounded-lg shadow-lg p-8 w-3/5 bg-white backdrop-blur-md"
            style={{
              background:
                "linear-gradient(to bottom right, #14b8a6, #fbbf24, #ef4444)",
            }}
          >
            <input
              type="text"
              placeholder="Search tokens..."
              className="px-4 py-2 mb-4 w-full border rounded focus:outline-none focus:ring focus:border-blue-300"
              style={{ color: "black" }} // Set text color explicitly
              onChange={(e) => handleSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />

            <ul className="space-y-3 max-h-60 overflow-y-auto">
              {/* Implement a maximum height and scrolling */}
              {filteredTokens.map((token, index) => (
                <li
                  key={index}
                  className="flex items-center px-4 py-3 hover:bg-gray-500 rounded cursor-pointer"
                  onClick={() => handleTokenSelect(token)}
                >
                  <img
                    src={token.img} // Assuming logoURI contains the image URL
                    alt={`${token.ticker} Logo`}
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-sm font-bold text-black">
                    {token.ticker}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {openModal2 && (
        <div
          className="fixed inset-0 z-50 bg-opacity-50 text-black font-bold flex items-center justify-center backdrop-blur-md"
          onClick={() => setOpenModal2(!openModal2)}
        >
          <div
            className="rounded-lg shadow-lg p-8 w-3/5 bg-white backdrop-blur-md"
            style={{
              background:
                "linear-gradient(to bottom right, #14b8a6, #fbbf24, #ef4444)",
            }}
          >
            <input
              type="text"
              placeholder="Search tokens..."
              className="px-4 py-2 mb-4 w-full border rounded focus:outline-none focus:ring focus:border-blue-300"
              style={{ color: "black" }}
              onChange={(e) => handleSearch2(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />

            <ul className="space-y-3 max-h-60 m-4 overflow-y-auto">
              {/* Implement a maximum height and scrolling */}
              {filteredTokens2.map((token, index) => (
                <li
                  key={index}
                  className="flex items-center px-4 py-3 hover:bg-gray-500 rounded cursor-pointer"
                  onClick={() => handleTokenSelect2(token)}
                >
                  <img
                    src={token.img} // Assuming logoURI contains the image URL
                    alt={`${token.name} Logo`}
                    className="w-8 h-8 mr-3"
                  />
                  <span className="text-sm font-bold text-black">
                    {token.ticker}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {isTokenOpen && (
        <TokenPopUp
          onClose={() => setIsTokenOpen(false)}
          onClick={handleSubmitForm}
        />
      )}
    </div>
  );
};
