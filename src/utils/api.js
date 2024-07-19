const API_URL = 'https://api.spacetraders.io/v2';

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message || 'API request failed');
  }
  return response.json();
};

export const getAgentData = async (token) => {
  const response = await fetch(`${API_URL}/my/agent`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getContracts = async (token) => {
  const response = await fetch(`${API_URL}/my/contracts`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getServerStatus = async () => {
  const response = await fetch(`${API_URL}/`);
  return handleResponse(response);
};

export const getShips = async (token) => {
  const response = await fetch(`${API_URL}/my/ships`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getShipDetails = async (token, shipSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const purchaseShip = async (token, shipType, waypointSymbol) => {
  const response = await fetch(`${API_URL}/my/ships`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ shipType, waypointSymbol })
  });
  return handleResponse(response);
};

export const scrapShip = async (token, shipSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/scrap`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const repairShip = async (token, shipSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/repair`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const refuelShip = async (token, shipSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/refuel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getSystems = async (token, limit = 20, page = 1) => {
  const response = await fetch(`${API_URL}/systems?limit=${limit}&page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getSystem = async (token, systemSymbol) => {
  const response = await fetch(`${API_URL}/systems/${systemSymbol}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getWaypoints = async (token, systemSymbol, limit = 20, page = 1) => {
  const response = await fetch(`${API_URL}/systems/${systemSymbol}/waypoints?limit=${limit}&page=${page}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getWaypoint = async (token, systemSymbol, waypointSymbol) => {
  const response = await fetch(`${API_URL}/systems/${systemSymbol}/waypoints/${waypointSymbol}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const navigateShip = async (token, shipSymbol, waypointSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/navigate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ waypointSymbol })
  });
  return handleResponse(response);
};

export const getShipNav = async (token, shipSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/nav`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const orbitShip = async (token, shipSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/orbit`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const dockShip = async (token, shipSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/dock`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const sellCargo = async (token, shipSymbol, good, units) => {
    const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/sell`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbol: good, units })
    });
    return handleResponse(response);
  };
  
export const deliverContract = async (token, contractId, shipSymbol, tradeSymbol, units) => {
  const response = await fetch(`${API_URL}/my/contracts/${contractId}/deliver`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ shipSymbol, tradeSymbol, units })
  });
  return handleResponse(response);
};

export const acceptContract = async (token, contractId) => {
  const response = await fetch(`${API_URL}/my/contracts/${contractId}/accept`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const getMarket = async (token, waypointSymbol, systemSymbol = null) => { 
  let url = `${API_URL}/systems`;

  if (systemSymbol) { 
    url += `/${systemSymbol}`;
  }

  url += `/waypoints/${waypointSymbol}/market`;

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};

export const extractResources = async (token, shipSymbol) => {
  const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/extract`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return handleResponse(response);
};
  
export const purchaseGoods = async (token, shipSymbol, good, units) => {
    const response = await fetch(`${API_URL}/my/ships/${shipSymbol}/purchase`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbol: good, units })
    });
    return handleResponse(response);
  };