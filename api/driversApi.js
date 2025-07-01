import api from "./config";

// Register as driver
export const registerAsDriver = async (vehicleData) => {
  try {
    const response = await api.post("/drivers/register", {
      vehicle: vehicleData
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Register driver error:", error);
    throw error;
  }
};

// Update vehicle information
export const updateVehicle = async (vehicleData) => {
  try {
    const response = await api.put("/drivers/vehicle", vehicleData);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Update vehicle error:", error);
    throw error;
  }
};

// Get driver profile with statistics
export const getDriverProfile = async () => {
  try {
    const response = await api.get("/drivers/profile");
    
    return { success: true, data: response.data.data };
  } catch (error) {
    console.error("Get driver profile error:", error);
    throw error;
  }
};

// Get driver's trips
export const getDriverTrips = async (options = {}) => {
  try {
    const { status, page = 1, limit = 10 } = options;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status })
    });

    const response = await api.get(`/drivers/trips?${queryParams}`);
    
    return { 
      success: true, 
      data: response.data.data,
      pagination: response.data.pagination,
      total: response.data.total
    };
  } catch (error) {
    console.error("Get driver trips error:", error);
    throw error;
  }
};

// Switch to passenger only mode
export const switchToPassenger = async () => {
  try {
    const response = await api.patch("/drivers/switch-to-passenger");
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Switch to passenger error:", error);
    throw error;
  }
};

// Get available ride requests (trips with pending passengers)
export const getAvailableRequests = async (options = {}) => {
  try {
    const { page = 1, limit = 20, location } = options;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      // Lọc trips có passengers với status pending
      hasPendingPassengers: 'true'
    });

    if (location) {
      queryParams.append('near', `${location.lat},${location.lng}`);
      queryParams.append('radius', '10'); // 10km radius
    }

    const response = await api.get(`/trips?${queryParams}`);
    
    return { 
      success: true, 
      data: response.data.data,
      pagination: response.data.pagination 
    };
  } catch (error) {
    console.error("Get available requests error:", error);
    throw error;
  }
}; 