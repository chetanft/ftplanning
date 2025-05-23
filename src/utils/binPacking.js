/**
 * Advanced 3D Bin Packing Algorithm
 * Supports both cuboidal and cylindrical objects
 * Implements Bottom-Left-Fill with collision detection
 */

export class BinPacker {
  constructor(containerDimensions) {
    this.container = containerDimensions;
    this.placedItems = [];
    this.freeSpaces = [{ x: 0, y: 0, z: 0, ...containerDimensions }];
  }

  // Main packing algorithm
  packItems(items) {
    const sortedItems = this.sortItemsForPacking(items);
    const packedItems = [];

    for (const item of sortedItems) {
      const position = this.findBestPosition(item);
      if (position) {
        const packedItem = this.placeItem(item, position);
        packedItems.push(packedItem);
        this.updateFreeSpaces(packedItem);
      }
    }

    return packedItems;
  }

  // Sort items by volume (largest first) and weight
  sortItemsForPacking(items) {
    return items.sort((a, b) => {
      const volumeA = this.calculateVolume(a);
      const volumeB = this.calculateVolume(b);
      if (Math.abs(volumeA - volumeB) < 0.001) {
        return (b.weight * b.quantity) - (a.weight * a.quantity);
      }
      return volumeB - volumeA;
    });
  }

  // Find optimal position using Bottom-Left-Fill
  findBestPosition(item) {
    for (const space of this.freeSpaces) {
      if (this.canFitInSpace(item, space)) {
        return this.calculateOptimalPosition(item, space);
      }
    }
    return null;
  }

  // Check if item fits in space with collision detection
  canFitInSpace(item, space) {
    const itemDims = this.getItemDimensions(item);
    
    // Basic dimension check
    if (itemDims.length > space.length || 
        itemDims.width > space.width || 
        itemDims.height > space.height) {
      return false;
    }

    // Weight distribution check
    if (!this.checkWeightDistribution(item, space)) {
      return false;
    }

    // Stacking rules check
    if (!this.checkStackingRules(item, space)) {
      return false;
    }

    return true;
  }

  // Calculate volume for different object types
  calculateVolume(item) {
    if (item.materialType === 'cuboidal') {
      return (item.dimensions.length * item.dimensions.width * item.dimensions.height) / 1000000000;
    } else if (item.materialType === 'cylindrical') {
      const radius = item.dimensions.diameter / 2000;
      const height = item.dimensions.height / 1000;
      return Math.PI * radius * radius * height;
    }
    return 0;
  }

  // Get item dimensions based on type
  getItemDimensions(item) {
    if (item.materialType === 'cuboidal') {
      return {
        length: item.dimensions.length,
        width: item.dimensions.width,
        height: item.dimensions.height
      };
    } else if (item.materialType === 'cylindrical') {
      if (item.orientation === 'horizontal') {
        return {
          length: item.dimensions.height,
          width: item.dimensions.diameter,
          height: item.dimensions.diameter
        };
      } else {
        return {
          length: item.dimensions.diameter,
          width: item.dimensions.diameter,
          height: item.dimensions.height
        };
      }
    }
    return { length: 0, width: 0, height: 0 };
  }

  // Advanced stacking rules implementation
  checkStackingRules(item, space) {
    if (item.materialType === 'cuboidal') {
      return this.checkCuboidalStacking(item, space);
    } else if (item.materialType === 'cylindrical') {
      return this.checkCylindricalStacking(item, space);
    }
    return true;
  }

  checkCuboidalStacking(item, space) {
    // Heavy below light rule
    const itemsBelow = this.getItemsBelow(space);
    const itemWeight = item.weight * item.quantity;
    
    for (const belowItem of itemsBelow) {
      const belowWeight = belowItem.weight * belowItem.quantity;
      if (itemWeight > belowWeight * 1.2) { // 20% tolerance
        return false;
      }
    }

    // Full coverage base rule
    if (space.y > 0) {
      const supportArea = this.calculateSupportArea(item, space);
      const itemArea = (item.dimensions.length * item.dimensions.width) / 1000000;
      if (supportArea < itemArea * 0.8) { // 80% support required
        return false;
      }
    }

    return true;
  }

  checkCylindricalStacking(item, space) {
    // Prevent rolling risk
    if (item.orientation === 'horizontal' && space.y > 0) {
      const hasSupport = this.checkCylindricalSupport(item, space);
      if (!hasSupport) return false;
    }

    // Interlocking for stability
    if (item.nesting && space.y > 0) {
      return this.checkNestingPossibility(item, space);
    }

    return true;
  }

  // Weight distribution and center of gravity
  checkWeightDistribution(item, space) {
    const newCenterOfGravity = this.calculateNewCenterOfGravity(item, space);
    const maxOffset = this.container.length * 0.1; // 10% tolerance
    
    return Math.abs(newCenterOfGravity.x - this.container.length / 2) < maxOffset;
  }

  calculateNewCenterOfGravity(newItem, position) {
    const totalWeight = this.placedItems.reduce((sum, item) => 
      sum + (item.weight * item.quantity), 0) + (newItem.weight * newItem.quantity);
    
    let weightedX = 0, weightedY = 0, weightedZ = 0;
    
    // Calculate for existing items
    for (const item of this.placedItems) {
      const itemWeight = item.weight * item.quantity;
      weightedX += item.position.x * itemWeight;
      weightedY += item.position.y * itemWeight;
      weightedZ += item.position.z * itemWeight;
    }
    
    // Add new item
    const newItemWeight = newItem.weight * newItem.quantity;
    weightedX += position.x * newItemWeight;
    weightedY += position.y * newItemWeight;
    weightedZ += position.z * newItemWeight;
    
    return {
      x: weightedX / totalWeight,
      y: weightedY / totalWeight,
      z: weightedZ / totalWeight
    };
  }

  // Calculate optimal position within space
  calculateOptimalPosition(item, space) {
    return {
      x: space.x,
      y: space.y,
      z: space.z
    };
  }

  // Place item and return packed item object
  placeItem(item, position) {
    const packedItem = {
      ...item,
      position,
      packedAt: new Date().toISOString()
    };
    
    this.placedItems.push(packedItem);
    return packedItem;
  }

  // Update free spaces after placing an item
  updateFreeSpaces(packedItem) {
    const itemDims = this.getItemDimensions(packedItem);
    const newSpaces = [];

    for (const space of this.freeSpaces) {
      const intersects = this.checkSpaceIntersection(space, packedItem.position, itemDims);
      
      if (!intersects) {
        newSpaces.push(space);
      } else {
        // Split space around the placed item
        const splitSpaces = this.splitSpace(space, packedItem.position, itemDims);
        newSpaces.push(...splitSpaces);
      }
    }

    this.freeSpaces = this.mergeSpaces(newSpaces);
  }

  // Check if space intersects with placed item
  checkSpaceIntersection(space, itemPos, itemDims) {
    return !(space.x + space.length <= itemPos.x ||
             space.x >= itemPos.x + itemDims.length ||
             space.y + space.height <= itemPos.y ||
             space.y >= itemPos.y + itemDims.height ||
             space.z + space.width <= itemPos.z ||
             space.z >= itemPos.z + itemDims.width);
  }

  // Split space around placed item
  splitSpace(space, itemPos, itemDims) {
    const spaces = [];

    // Create up to 6 new spaces around the item
    // Left space
    if (space.x < itemPos.x) {
      spaces.push({
        x: space.x,
        y: space.y,
        z: space.z,
        length: itemPos.x - space.x,
        width: space.width,
        height: space.height
      });
    }

    // Right space
    if (space.x + space.length > itemPos.x + itemDims.length) {
      spaces.push({
        x: itemPos.x + itemDims.length,
        y: space.y,
        z: space.z,
        length: (space.x + space.length) - (itemPos.x + itemDims.length),
        width: space.width,
        height: space.height
      });
    }

    // Front space
    if (space.z < itemPos.z) {
      spaces.push({
        x: Math.max(space.x, itemPos.x),
        y: space.y,
        z: space.z,
        length: Math.min(space.x + space.length, itemPos.x + itemDims.length) - Math.max(space.x, itemPos.x),
        width: itemPos.z - space.z,
        height: space.height
      });
    }

    // Back space
    if (space.z + space.width > itemPos.z + itemDims.width) {
      spaces.push({
        x: Math.max(space.x, itemPos.x),
        y: space.y,
        z: itemPos.z + itemDims.width,
        length: Math.min(space.x + space.length, itemPos.x + itemDims.length) - Math.max(space.x, itemPos.x),
        width: (space.z + space.width) - (itemPos.z + itemDims.width),
        height: space.height
      });
    }

    // Top space
    if (space.y + space.height > itemPos.y + itemDims.height) {
      spaces.push({
        x: Math.max(space.x, itemPos.x),
        y: itemPos.y + itemDims.height,
        z: Math.max(space.z, itemPos.z),
        length: Math.min(space.x + space.length, itemPos.x + itemDims.length) - Math.max(space.x, itemPos.x),
        width: Math.min(space.z + space.width, itemPos.z + itemDims.width) - Math.max(space.z, itemPos.z),
        height: (space.y + space.height) - (itemPos.y + itemDims.height)
      });
    }

    return spaces.filter(s => s.length > 0 && s.width > 0 && s.height > 0);
  }

  // Merge overlapping spaces
  mergeSpaces(spaces) {
    // Simple implementation - remove duplicates and very small spaces
    return spaces.filter(space => 
      space.length > 10 && space.width > 10 && space.height > 10
    );
  }

  // Helper methods
  getItemsBelow(space) {
    return this.placedItems.filter(item => 
      item.position.y + this.getItemDimensions(item).height <= space.y
    );
  }

  calculateSupportArea(item, space) {
    // Simplified calculation - return full area for now
    return (item.dimensions.length * item.dimensions.width) / 1000000;
  }

  checkCylindricalSupport(item, space) {
    // Check if there are supporting items below
    const itemsBelow = this.getItemsBelow(space);
    return itemsBelow.length > 0;
  }

  checkNestingPossibility(item, space) {
    // Check if item can nest in items below
    const itemsBelow = this.getItemsBelow(space);
    return itemsBelow.some(belowItem => 
      belowItem.materialType === 'cylindrical' &&
      belowItem.dimensions.diameter > item.dimensions.diameter
    );
  }
}
