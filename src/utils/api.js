import axios from 'axios';
import rateLimit from 'axios-rate-limit';

const API_URL = 'https://api.spacetraders.io/v2';

// Access token from .env
const token = process.env.REACT_APP_SPACETRADERS_TOKEN;

// Create a rate-limited Axios instance 
const api = rateLimit(axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${token}`
  }
}), { maxRequests: 1.8, perMilliseconds: 1000 }); 

// Simplified error handling 
const handleError = (error) => {
  throw new Error(error.response?.data?.error?.message || 'API request failed');
};

export const getAgentData = async () => {
  try {
    const response = await api.get('/my/agent');
    return response.data; 
  } catch (error) {
    handleError(error);
  }
};

export const getContracts = async () => {
  try {
    const response = await api.get('/my/contracts');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getServerStatus = async () => {
  try {
    // No authorization needed for server status
    const response = await axios.get(`${API_URL}/`); 
    return response.data; 
  } catch (error) {
    handleError(error);
  }
};

export const getShips = async () => {
  try {
    const response = await api.get('/my/ships');
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getShipDetails = async (shipSymbol) => {
  try {
    const response = await api.get(`/my/ships/${shipSymbol}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const purchaseShip = async (shipType, waypointSymbol) => {
  try {
    const response = await api.post('/my/ships', { shipType, waypointSymbol });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const scrapShip = async (shipSymbol) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/scrap`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const repairShip = async (shipSymbol) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/repair`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const refuelShip = async (shipSymbol) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/refuel`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getSystems = async (limit = 20, page = 1) => {
  try {
    const response = await api.get(`/systems?limit=${limit}&page=${page}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getSystem = async (systemSymbol) => {
  try {
    const response = await api.get(`/systems/${systemSymbol}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getWaypoints = async (systemSymbol, limit = 20, page = 1) => {
  try {
    const response = await api.get(`/systems/${systemSymbol}/waypoints?limit=${limit}&page=${page}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getWaypoint = async (systemSymbol, waypointSymbol) => {
  try {
    const response = await api.get(`/systems/${systemSymbol}/waypoints/${waypointSymbol}`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const navigateShip = async (shipSymbol, waypointSymbol) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/navigate`, { waypointSymbol });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getShipNav = async (shipSymbol) => {
  try {
    const response = await api.get(`/my/ships/${shipSymbol}/nav`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const orbitShip = async (shipSymbol) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/orbit`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const dockShip = async (shipSymbol) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/dock`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const sellCargo = async (shipSymbol, good, units) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/sell`, { symbol: good, units });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const deliverContract = async (contractId, shipSymbol, tradeSymbol, units) => {
  try {
    const response = await api.post(`/my/contracts/${contractId}/deliver`, { shipSymbol, tradeSymbol, units });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const acceptContract = async (contractId) => {
  try {
    const response = await api.post(`/my/contracts/${contractId}/accept`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getMarket = async (waypointSymbol, systemSymbol = null) => {
  try {
    let url = '/systems';
    if (systemSymbol) {
      url += `/${systemSymbol}`;
    }
    url += `/waypoints/${waypointSymbol}/market`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const extractResources = async (shipSymbol) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/extract`);
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const purchaseGoods = async (shipSymbol, good, units) => {
  try {
    const response = await api.post(`/my/ships/${shipSymbol}/purchase`, { symbol: good, units });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};