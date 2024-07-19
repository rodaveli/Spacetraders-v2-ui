import React, { useState, useEffect } from 'react';
import { getMarket, sellCargo } from '../utils/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const MarketTrading = ({ token, ships }) => {
  const [marketData, setMarketData] = useState(null);
  const [selectedShip, setSelectedShip] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedShip) {
      fetchMarketData(selectedShip.nav.systemSymbol, selectedShip.nav.waypointSymbol);
    }
  }, [selectedShip]);

  const fetchMarketData = async (systemSymbol, waypointSymbol) => {
    setIsLoading(true);
    try {
      const response = await getMarket(token, systemSymbol, waypointSymbol);
      setMarketData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSellCargo = async (shipSymbol, good, units) => {
    try {
      await sellCargo(token, shipSymbol, good, units);
      // Refresh market data and ship cargo after selling
      fetchMarketData(selectedShip.nav.systemSymbol, selectedShip.nav.waypointSymbol);
      // You would also need to update the ship's cargo here
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <div>Loading market data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Market Trading</h2>
      <div className="mb-4">
        <select
          className="p-2 border rounded"
          onChange={(e) => setSelectedShip(ships.find(ship => ship.symbol === e.target.value))}
        >
          <option value="">Select a ship</option>
          {ships.map(ship => (
            <option key={ship.symbol} value={ship.symbol}>{ship.symbol}</option>
          ))}
        </select>
      </div>
      {marketData && (
        <div>
          <h3 className="text-xl font-semibold mb-2">Market: {marketData.symbol}</h3>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="px-4 py-2">Good</th>
                <th className="px-4 py-2">Supply</th>
                <th className="px-4 py-2">Purchase Price</th>
                <th className="px-4 py-2">Sell Price</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {marketData.tradeGoods.map(good => (
                <tr key={good.symbol}>
                  <td className="border px-4 py-2">{good.symbol}</td>
                  <td className="border px-4 py-2">{good.supply}</td>
                  <td className="border px-4 py-2">{good.purchasePrice}</td>
                  <td className="border px-4 py-2">{good.sellPrice}</td>
                  <td className="border px-4 py-2">
                    <button
                      className="bg-green-500 text-white px-2 py-1 rounded"
                      onClick={() => handleSellCargo(selectedShip.symbol, good.symbol, 1)}
                    >
                      Sell 1
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-2">Price Trends</h3>
            <LineChart width={600} height={300} data={marketData.tradeGoods}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="symbol" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="purchasePrice" stroke="#8884d8" />
              <Line type="monotone" dataKey="sellPrice" stroke="#82ca9d" />
            </LineChart>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketTrading;