import React, { useState, useEffect } from 'react';
import { getMarket, purchaseGoods, sellCargo, getShipDetails } from '../utils/api';


const MarketTrading = ({ token, ships }) => {
  const [selectedShip, setSelectedShip] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [error, setError] = useState(null);
  const [action, setAction] = useState('buy');
  const [amount, setAmount] = useState(1);
  const [selectedGood, setSelectedGood] = useState('');

  useEffect(() => {
    if (selectedShip) {
      const fetchData = async () => {
        try {
          const shipDetails = await getShipDetails(token, selectedShip.symbol);
          setSelectedShip(shipDetails.data); 
          fetchMarketData(shipDetails.data.nav.waypointSymbol);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchData();
    }
  }, [selectedShip, token]); 

  const fetchMarketData = async () => {
    try {
      const response = await getMarket(token, selectedShip.nav.waypointSymbol, selectedShip.nav.systemSymbol); // Pass both symbols
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

      // Refresh market and ship data after the transaction
      fetchMarketData(selectedShip.nav.waypointSymbol); 
      const updatedShip = await getShipDetails(token, selectedShip.symbol);
      setSelectedShip(updatedShip.data);

    } catch (err) {
      setError(err.message);
    }
  };

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="market-trading">
      <select onChange={(e) => setSelectedShip(ships.find(ship => ship.symbol === e.target.value))}>
        <option value="">Select a ship</option>
        {ships.map(ship => (
          <option key={ship.symbol} value={ship.symbol}>{ship.symbol}</option>
        ))}
      </select>

      {selectedShip && selectedShip.cargo && ( 
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

      {marketData && (
        <div>
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
                      onChange={(e) => setAmount(parseInt(e.target.value) || 1)} // Ensure a valid number
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
      )}
    </div>
  );
};

export default MarketTrading;