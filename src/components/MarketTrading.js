import React, { useState, useEffect } from 'react';
import { getMarket, purchaseGoods, sellCargo, getShipDetails, getAgentData } from '../utils/api';

const MarketTrading = ({ token, ships }) => {
  const [selectedShip, setSelectedShip] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [error, setError] = useState(null);
  const [agentCredits, setAgentCredits] = useState(0);

  useEffect(() => {
    if (selectedShip) {
      const fetchData = async () => {
        try {
          const shipDetails = await getShipDetails(token, selectedShip.symbol);
          setSelectedShip(shipDetails.data);
          fetchMarketData(shipDetails.data.nav.waypointSymbol);
          const agentData = await getAgentData(token);
          setAgentCredits(agentData.data.credits);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchData();
    }
  }, [selectedShip, token]);

  const fetchMarketData = async (waypointSymbol) => {
    try {
      const response = await getMarket(token, waypointSymbol, selectedShip.nav.systemSymbol);
      setMarketData(response.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTransaction = async (action, good, quantity) => {
    try {
      if (action === 'buy') {
        await purchaseGoods(token, selectedShip.symbol, good, quantity);
      } else {
        await sellCargo(token, selectedShip.symbol, good, quantity);
      }

      // Refresh market and ship data after the transaction
      fetchMarketData(selectedShip.nav.waypointSymbol);
      const updatedShip = await getShipDetails(token, selectedShip.symbol);
      setSelectedShip(updatedShip.data);
      const agentData = await getAgentData(token);
      setAgentCredits(agentData.data.credits);

    } catch (err) {
      setError(err.message);
    }
  };

  const calculateProfitMargin = (purchasePrice, sellPrice) => {
    return ((sellPrice - purchasePrice) / purchasePrice * 100).toFixed(2);
  };

  const getCargoQuantity = (symbol) => {
    const cargoItem = selectedShip.cargo.inventory.find(item => item.symbol === symbol);
    return cargoItem ? cargoItem.units : 0;
  };

  if (error) return <div className="text-red-500 p-4 bg-red-100 border border-red-400 rounded">Error: {error}</div>;

  return (
    <div className="market-trading p-4">
      <h2 className="text-2xl font-bold mb-4">Market Trading</h2>
      <div className="mb-4">
        <label htmlFor="ship-select" className="mr-2">Select a ship:</label>
        <select
          id="ship-select"
          onChange={(e) => setSelectedShip(ships.find(ship => ship.symbol === e.target.value))}
          className="p-2 border rounded"
        >
          <option value="">Select a ship</option>
          {ships.map(ship => (
            <option key={ship.symbol} value={ship.symbol}>{ship.symbol}</option>
          ))}
        </select>
      </div>

      {selectedShip && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold">Ship: {selectedShip.symbol}</h3>
          <p>Credits: {agentCredits}</p>
          <p>Cargo Space: {selectedShip.cargo.units} / {selectedShip.cargo.capacity}</p>
        </div>
      )}

      {marketData && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Market: {marketData.symbol}</h3>
          <table className="w-full border-collapse border border-gray-300 mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Good</th>
                <th className="p-2 border">Supply</th>
                <th className="p-2 border">Purchase Price</th>
                <th className="p-2 border">Sell Price</th>
                <th className="p-2 border">Trade Volume</th>
                <th className="p-2 border">Cargo Quantity</th>
                <th className="p-2 border">Profit Margin</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {marketData.tradeGoods.map(good => (
                <tr key={good.symbol}>
                  <td className="p-2 border">{good.symbol}</td>
                  <td className="p-2 border">{good.supply}</td>
                  <td className="p-2 border">{good.purchasePrice}</td>
                  <td className="p-2 border">{good.sellPrice}</td>
                  <td className="p-2 border">{good.tradeVolume}</td>
                  <td className="p-2 border">{getCargoQuantity(good.symbol)}</td>
                  <td className="p-2 border">{calculateProfitMargin(good.purchasePrice, good.sellPrice)}%</td>
                  <td className="p-2 border">
                    <input 
                      type="number" 
                      min="1" 
                      max={good.tradeVolume}
                      className="w-16 p-1 border rounded mr-2"
                    />
                    <button 
                      onClick={() => {
                        const quantity = parseInt(document.querySelector(`input[type="number"]`).value);
                        if (quantity > 0 && quantity <= good.tradeVolume && (selectedShip.cargo.capacity - selectedShip.cargo.units) >= quantity && agentCredits >= (good.purchasePrice * quantity)) {
                          handleTransaction('buy', good.symbol, quantity);
                        } else {
                          setError("Invalid purchase: Check quantity, cargo space, and credits.");
                        }
                      }}
                      className="bg-blue-500 text-white px-2 py-1 rounded mr-2"
                    >
                      Buy
                    </button>
                    <button 
                      onClick={() => {
                        const quantity = parseInt(document.querySelector(`input[type="number"]`).value);
                        if (quantity > 0 && quantity <= getCargoQuantity(good.symbol)) {
                          handleTransaction('sell', good.symbol, quantity);
                        } else {
                          setError("Invalid sale: Check quantity and cargo.");
                        }
                      }}
                      className="bg-green-500 text-white px-2 py-1 rounded"
                    >
                      Sell
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="text-xl font-semibold mb-2">Ship Cargo</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Good</th>
                <th className="p-2 border">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {selectedShip.cargo.inventory.map(item => (
                <tr key={item.symbol}>
                  <td className="p-2 border">{item.symbol}</td>
                  <td className="p-2 border">{item.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MarketTrading;