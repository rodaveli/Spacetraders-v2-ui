import React, { useState, useEffect } from 'react';
import { getMarket, sellCargo, purchaseGoods } from '../utils/api';

const MarketTrading = ({ token, ships }) => {
  const [selectedShip, setSelectedShip] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [error, setError] = useState(null);
  const [action, setAction] = useState('buy');
  const [amount, setAmount] = useState(1);
  const [selectedGood, setSelectedGood] = useState('');

  useEffect(() => {
    if (selectedShip) {
      fetchMarketData(selectedShip.nav.waypointSymbol);
    }
  }, [selectedShip]);

  const fetchMarketData = async (waypointSymbol) => {
    try {
      const response = await getMarket(token, waypointSymbol);
      setMarketData(response.data);
    } catch (err) {
      setError(err.message);
    }
  };
const handleTransaction = async () => {
    try {
    if (action === 'buy') {
        await purchaseGoods(token, selectedShip.symbol, selectedGood, amount);
    } else {
        await sellCargo(token, selectedShip.symbol, selectedGood, amount);
    }
    // Refresh market data and ship cargo after transaction
    fetchMarketData(selectedShip.nav.waypointSymbol);
    } catch (err) {
    setError(err.message);
    }
};

  if (error) return <div>Error: {error}</div>;
  if (!marketData) return <div>Select a ship to view market data</div>;

  return (
    <div className="market-trading">
      <select onChange={(e) => setSelectedShip(ships.find(ship => ship.symbol === e.target.value))}>
        <option value="">Select a ship</option>
        {ships.map(ship => (
          <option key={ship.symbol} value={ship.symbol}>{ship.symbol}</option>
        ))}
      </select>

      {selectedShip && (
        <div>
          <h2>Cargo for {selectedShip.symbol}</h2>
          <table>
            <thead>
              <tr>
                <th>Good</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {selectedShip.cargo.inventory.map(item => (
                <tr key={item.symbol}>
                  <td>{item.symbol}</td>
                  <td>{item.units}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>Market: {marketData.symbol}</h2>
      <table>
        <thead>
          <tr>
            <th>Good</th>
            <th>Supply</th>
            <th>Purchase Price</th>
            <th>Sell Price</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {marketData.tradeGoods.map(good => (
            <tr key={good.symbol}>
              <td>{good.symbol}</td>
              <td>{good.supply}</td>
              <td>{good.purchasePrice}</td>
              <td>{good.sellPrice}</td>
              <td>
                <select onChange={(e) => setAction(e.target.value)}>
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
                <input 
                  type="number" 
                  min="1" 
                  value={amount} 
                  onChange={(e) => setAmount(parseInt(e.target.value))}
                />
                <button onClick={() => {
                  setSelectedGood(good.symbol);
                  handleTransaction();
                }}>
                  {action.charAt(0).toUpperCase() + action.slice(1)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MarketTrading;