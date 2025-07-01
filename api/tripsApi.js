import api from "./config";

// Get vehicle types (không cần auth)
export const getVehicleTypes = async () => {
  try {
    const response = await api.get("/trips/vehicle-types");
    return response.data;
  } catch (error) {
    console.error("Get vehicle types error:", error);
    throw error.response?.data || { message: "Lấy loại xe thất bại" };
  }
};

// Ước tính giá trước khi tạo chuyến đi
export const estimatePrice = async (priceData) => {
  try {
    const response = await api.post("/trips/estimate-price", priceData);
    return response.data;
  } catch (error) {
    console.error("Estimate price error:", error);
    throw error.response?.data || { message: "Ước tính giá thất bại" };
  }
};

// Get all trips với filters
export const getAllTrips = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Thêm các filter parameters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/trips?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Get all trips error:", error);
    throw error.response?.data || { message: "Lấy danh sách chuyến đi thất bại" };
  }
};

// Get available booking requests for drivers
export const getAvailableBookings = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Set role to driver to get available bookings
    queryParams.append('role', 'driver');
    
    // Add other filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/trips?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Get available bookings error:", error);
    throw error.response?.data || { message: "Lấy danh sách yêu cầu đặt xe thất bại" };
  }
};

// Get passenger's booking requests
export const getPassengerBookings = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Set role to passenger to get own booking requests
    queryParams.append('role', 'passenger');
    
    // Add other filters
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/trips?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Get passenger bookings error:", error);
    throw error.response?.data || { message: "Lấy danh sách booking thất bại" };
  }
};

// Get single trip by ID
export const getTripById = async (tripId) => {
  try {
    const response = await api.get(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("Get trip by ID error:", error);
    throw error.response?.data || { message: "Lấy thông tin chuyến đi thất bại" };
  }
};

// Get my trips (as driver)
export const getMyTrips = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/trips/my-trips?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Get my trips error:", error);
    throw error.response?.data || { message: "Lấy chuyến đi của tôi thất bại" };
  }
};

// Get my joined trips (as passenger)
export const getMyJoinedTrips = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await api.get(`/trips/my-joined-trips?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error("Get my joined trips error:", error);
    throw error.response?.data || { message: "Lấy chuyến đi đã tham gia thất bại" };
  }
};

// Create new booking request (passenger creates booking request)
export const createBookingRequest = async (bookingData) => {
  try {
    const response = await api.post("/trips", bookingData);
    return response.data;
  } catch (error) {
    console.error("Create booking request error:", error);
    throw error.response?.data || { message: "Tạo yêu cầu đặt xe thất bại" };
  }
};

// Create new trip (legacy - still supported)
export const createTrip = async (tripData) => {
  try {
    const response = await api.post("/trips", tripData);
    return response.data;
  } catch (error) {
    console.error("Create trip error:", error);
    throw error.response?.data || { message: "Tạo chuyến đi thất bại" };
  }
};

// Driver request to accept a booking
export const driverRequestBooking = async (tripId, requestData) => {
  try {
    const response = await api.post(`/trips/${tripId}/driver-request`, requestData);
    return response.data;
  } catch (error) {
    console.error("Driver request booking error:", error);
    throw error.response?.data || { message: "Gửi yêu cầu nhận chuyến thất bại" };
  }
};

// Passenger respond to driver request (accept/decline)
export const respondToDriverRequest = async (tripId, requestId, action) => {
  try {
    const response = await api.patch(`/trips/${tripId}/driver-requests/${requestId}`, { action });
    return response.data;
  } catch (error) {
    console.error("Respond to driver request error:", error);
    throw error.response?.data || { message: "Phản hồi yêu cầu tài xế thất bại" };
  }
};

// Update trip (driver only)
export const updateTrip = async (tripId, tripData) => {
  try {
    const response = await api.put(`/trips/${tripId}`, tripData);
    return response.data;
  } catch (error) {
    console.error("Update trip error:", error);
    throw error.response?.data || { message: "Cập nhật chuyến đi thất bại" };
  }
};

// Delete trip (driver only)
export const deleteTrip = async (tripId) => {
  try {
    const response = await api.delete(`/trips/${tripId}`);
    return response.data;
  } catch (error) {
    console.error("Delete trip error:", error);
    throw error.response?.data || { message: "Xóa chuyến đi thất bại" };
  }
};

// Cancel trip (driver only)
export const cancelTrip = async (tripId, reason) => {
  try {
    const response = await api.patch(`/trips/${tripId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error("Cancel trip error:", error);
    throw error.response?.data || { message: "Hủy chuyến đi thất bại" };
  }
};

// Update trip status (driver only)
export const updateTripStatus = async (tripId, status) => {
  try {
    const response = await api.patch(`/trips/${tripId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Update trip status error:", error);
    throw error.response?.data || { message: "Cập nhật trạng thái chuyến đi thất bại" };
  }
};

// Accept or decline passenger request (driver only) - Legacy
export const updatePassengerStatus = async (tripId, passengerId, status) => {
  try {
    const response = await api.patch(`/trips/${tripId}/passengers/${passengerId}`, { status });
    return response.data;
  } catch (error) {
    console.error("Update passenger status error:", error);
    throw error.response?.data || { message: "Cập nhật trạng thái hành khách thất bại" };
  }
};

// Join trip as passenger - Legacy
export const joinTrip = async (tripId, passengerData) => {
  try {
    const response = await api.post(`/trips/${tripId}/join`, passengerData);
    return response.data;
  } catch (error) {
    console.error("Join trip error:", error);
    throw error.response?.data || { message: "Tham gia chuyến đi thất bại" };
  }
};

// Cancel join request or leave trip - Legacy
export const cancelJoinRequest = async (tripId) => {
  try {
    const response = await api.delete(`/trips/${tripId}/join`);
    return response.data;
  } catch (error) {
    console.error("Cancel join request error:", error);
    throw error.response?.data || { message: "Hủy yêu cầu tham gia thất bại" };
  }
};

// Search trips by location
export const searchTripsByLocation = async (searchParams) => {
  try {
    const {
      startLat,
      startLng,
      endLat,
      endLng,
      distance = 10000, // 10km default
      departureTime,
      seats = 1,
      ...otherFilters
    } = searchParams;

    const filters = {
      startLat,
      startLng,
      endLat,
      endLng,
      distance,
      seats,
      ...otherFilters
    };

    if (departureTime) {
      filters.fromDate = departureTime;
    }

    return await getAllTrips(filters);
  } catch (error) {
    console.error("Search trips by location error:", error);
    throw error.response?.data || { message: "Tìm kiếm chuyến đi thất bại" };
  }
}; 