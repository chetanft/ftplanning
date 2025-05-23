/**
 * Google Maps API Integration Service
 * Handles route optimization, distance calculations, and traffic data
 */

class GoogleMapsService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  // Calculate optimal routes using Google Routes API
  async calculateOptimalRoute(waypoints, options = {}) {
    const {
      travelMode = 'DRIVE',
      optimizeWaypoints = true,
      avoidTolls = false,
      avoidHighways = false
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/directions/json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey
        },
        body: JSON.stringify({
          origin: waypoints[0],
          destination: waypoints[waypoints.length - 1],
          waypoints: waypoints.slice(1, -1).map(wp => ({ location: wp })),
          optimizeWaypoints,
          travelMode,
          avoidTolls,
          avoidHighways,
          departureTime: 'now'
        })
      });

      const data = await response.json();
      return this.processRouteResponse(data);
    } catch (error) {
      console.error('Route calculation failed:', error);
      throw new Error('Failed to calculate optimal route');
    }
  }

  // Calculate distance matrix for multiple origins/destinations
  async calculateDistanceMatrix(origins, destinations) {
    try {
      const response = await fetch(
        `${this.baseUrl}/distancematrix/json?` +
        `origins=${origins.join('|')}&` +
        `destinations=${destinations.join('|')}&` +
        `key=${this.apiKey}&` +
        `departure_time=now&` +
        `traffic_model=best_guess`
      );

      const data = await response.json();
      return this.processDistanceMatrix(data);
    } catch (error) {
      console.error('Distance matrix calculation failed:', error);
      throw new Error('Failed to calculate distance matrix');
    }
  }

  // Multi-vehicle route optimization
  async optimizeMultiVehicleRoutes(vehicles, orders) {
    const optimizedRoutes = [];

    for (const vehicle of vehicles) {
      const vehicleOrders = orders.filter(order => 
        vehicle.assignedOrders?.includes(order.id) || vehicle.orders?.includes(order)
      );

      if (vehicleOrders.length > 0) {
        const waypoints = this.extractWaypoints(vehicleOrders);
        const route = await this.calculateOptimalRoute(waypoints, {
          optimizeWaypoints: true
        });

        optimizedRoutes.push({
          vehicleId: vehicle.id,
          route,
          orders: vehicleOrders,
          totalDistance: route.totalDistance,
          totalDuration: route.totalDuration,
          estimatedCost: route.totalDistance * (vehicle.costPerKm || 25)
        });
      }
    }

    return optimizedRoutes;
  }

  // Extract waypoints from orders
  extractWaypoints(orders) {
    const waypoints = [];
    
    // Add pickup points
    orders.forEach(order => {
      if (order.pickup && !waypoints.includes(order.pickup)) {
        waypoints.push(order.pickup);
      }
    });

    // Add delivery points
    orders.forEach(order => {
      if (order.delivery && !waypoints.includes(order.delivery)) {
        waypoints.push(order.delivery);
      }
    });

    return waypoints;
  }

  // Process Google Maps API response
  processRouteResponse(data) {
    if (data.status !== 'OK') {
      throw new Error(`Route calculation failed: ${data.status}`);
    }

    const route = data.routes[0];

    return {
      totalDistance: route.legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000, // km
      totalDuration: route.legs.reduce((sum, leg) => sum + leg.duration.value, 0) / 3600, // hours
      waypoints: route.waypoint_order || [],
      polyline: route.overview_polyline.points,
      steps: route.legs.flatMap(leg => leg.steps),
      trafficInfo: {
        durationInTraffic: route.legs.reduce((sum, leg) => 
          sum + (leg.duration_in_traffic?.value || leg.duration.value), 0) / 3600
      }
    };
  }

  // Process distance matrix response
  processDistanceMatrix(data) {
    if (data.status !== 'OK') {
      throw new Error(`Distance matrix calculation failed: ${data.status}`);
    }

    return data.rows.map((row, originIndex) => 
      row.elements.map((element, destIndex) => ({
        origin: data.origin_addresses[originIndex],
        destination: data.destination_addresses[destIndex],
        distance: element.distance?.value / 1000 || 0, // km
        duration: element.duration?.value / 3600 || 0, // hours
        durationInTraffic: element.duration_in_traffic?.value / 3600 || 0 // hours
      }))
    );
  }

  // Geocode address to coordinates
  async geocodeAddress(address) {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
          formattedAddress: data.results[0].formatted_address
        };
      }
      
      throw new Error(`Geocoding failed: ${data.status}`);
    } catch (error) {
      console.error('Geocoding failed:', error);
      throw new Error('Failed to geocode address');
    }
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat, lng) {
    try {
      const response = await fetch(
        `${this.baseUrl}/geocode/json?latlng=${lat},${lng}&key=${this.apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        return {
          formattedAddress: data.results[0].formatted_address,
          components: data.results[0].address_components
        };
      }
      
      throw new Error(`Reverse geocoding failed: ${data.status}`);
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      throw new Error('Failed to reverse geocode coordinates');
    }
  }

  // Get traffic information for a route
  async getTrafficInfo(origin, destination) {
    try {
      const response = await fetch(
        `${this.baseUrl}/directions/json?` +
        `origin=${encodeURIComponent(origin)}&` +
        `destination=${encodeURIComponent(destination)}&` +
        `departure_time=now&` +
        `traffic_model=best_guess&` +
        `key=${this.apiKey}`
      );

      const data = await response.json();
      
      if (data.status === 'OK') {
        const route = data.routes[0];
        const leg = route.legs[0];
        
        return {
          normalDuration: leg.duration.value / 3600, // hours
          trafficDuration: leg.duration_in_traffic?.value / 3600 || leg.duration.value / 3600,
          trafficDelay: (leg.duration_in_traffic?.value - leg.duration.value) / 3600 || 0,
          trafficCondition: this.getTrafficCondition(leg.duration_in_traffic?.value, leg.duration.value)
        };
      }
      
      throw new Error(`Traffic info failed: ${data.status}`);
    } catch (error) {
      console.error('Traffic info failed:', error);
      return null;
    }
  }

  // Determine traffic condition based on delay
  getTrafficCondition(trafficDuration, normalDuration) {
    if (!trafficDuration || !normalDuration) return 'unknown';
    
    const delayRatio = trafficDuration / normalDuration;
    
    if (delayRatio < 1.1) return 'light';
    if (delayRatio < 1.3) return 'moderate';
    if (delayRatio < 1.5) return 'heavy';
    return 'severe';
  }

  // Calculate ETA with traffic
  calculateETA(departureTime, durationInTraffic) {
    const departure = new Date(departureTime);
    const eta = new Date(departure.getTime() + (durationInTraffic * 3600 * 1000));
    return eta;
  }

  // Optimize delivery sequence based on time windows
  async optimizeDeliverySequence(orders, vehicleLocation) {
    const waypoints = orders.map(order => order.delivery);
    
    // Calculate distance matrix
    const origins = [vehicleLocation, ...waypoints];
    const destinations = waypoints;
    
    const distanceMatrix = await this.calculateDistanceMatrix(origins, destinations);
    
    // Simple nearest neighbor algorithm for demonstration
    const optimizedSequence = [];
    const remaining = [...orders];
    let currentLocation = vehicleLocation;
    
    while (remaining.length > 0) {
      let nearestIndex = 0;
      let nearestDistance = Infinity;
      
      remaining.forEach((order, index) => {
        const distance = this.calculateDistance(currentLocation, order.delivery);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });
      
      const nearestOrder = remaining.splice(nearestIndex, 1)[0];
      optimizedSequence.push(nearestOrder);
      currentLocation = nearestOrder.delivery;
    }
    
    return optimizedSequence;
  }

  // Simple distance calculation (Haversine formula)
  calculateDistance(point1, point2) {
    // This is a simplified version - in real implementation,
    // you would use the distance matrix API results
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lng - point1.lng);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRad(point1.lat)) * Math.cos(this.toRad(point2.lat)) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI/180);
  }
}

export default GoogleMapsService;
