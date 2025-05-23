/**
 * Specialized Cylindrical Object Packing Algorithm
 * Handles nesting, interlocking, and stability
 */

export class CylindricalPacker {
  constructor(containerDimensions, existingPlan = null) {
    this.container = containerDimensions;
    this.existingItems = existingPlan?.items || [];
    this.packedItems = [];
  }

  packItems(cylindricalOrders) {
    const packedItems = [];

    // Group by orientation and size for optimal packing
    const verticalItems = cylindricalOrders.filter(item => 
      item.orientation === 'vertical' || !item.orientation
    );
    const horizontalItems = cylindricalOrders.filter(item => 
      item.orientation === 'horizontal'
    );

    // Pack vertical cylinders first (more stable)
    packedItems.push(...this.packVerticalCylinders(verticalItems));
    
    // Pack horizontal cylinders in remaining space
    packedItems.push(...this.packHorizontalCylinders(horizontalItems));

    return packedItems;
  }

  packVerticalCylinders(items) {
    const packedItems = [];
    const sortedItems = this.sortByDiameter(items);

    for (const item of sortedItems) {
      if (item.nesting) {
        const position = this.findNestingPosition(item);
        if (position) {
          packedItems.push(this.createPackedItem(item, position));
          continue;
        }
      }

      // Regular circular packing
      const position = this.findCircularPackingPosition(item);
      if (position) {
        packedItems.push(this.createPackedItem(item, position));
      }
    }

    return packedItems;
  }

  packHorizontalCylinders(items) {
    const packedItems = [];

    for (const item of items) {
      // Horizontal cylinders need special support structure
      const position = this.findHorizontalPosition(item);
      if (position) {
        const packedItem = this.createPackedItem(item, position);
        
        // Add support wedges if needed
        if (!item.fragile) {
          packedItem.supportStructure = this.calculateSupportWedges(item, position);
        }
        
        packedItems.push(packedItem);
      }
    }

    return packedItems;
  }

  // Find optimal position for nesting cylinders
  findNestingPosition(item) {
    const compatibleItems = this.findNestingCompatibleItems(item);
    
    for (const baseItem of compatibleItems) {
      const nestingPosition = this.calculateNestingPosition(item, baseItem);
      if (this.validateNestingPosition(item, nestingPosition)) {
        return nestingPosition;
      }
    }

    return null;
  }

  // Find compatible items for nesting
  findNestingCompatibleItems(item) {
    return this.packedItems.filter(packedItem => {
      // Can only nest in larger cylinders
      if (packedItem.materialType !== 'cylindrical') return false;
      if (packedItem.dimensions.diameter <= item.dimensions.diameter) return false;
      
      // Check if there's enough height clearance
      const heightDiff = packedItem.dimensions.height - item.dimensions.height;
      return heightDiff >= 50; // 50mm minimum clearance
    });
  }

  // Calculate nesting position
  calculateNestingPosition(item, baseItem) {
    const radiusDiff = (baseItem.dimensions.diameter - item.dimensions.diameter) / 2;
    const maxOffset = radiusDiff * 0.8; // 80% of available space
    
    return {
      x: baseItem.position.x + (Math.random() - 0.5) * maxOffset,
      y: baseItem.position.y + baseItem.dimensions.height,
      z: baseItem.position.z + (Math.random() - 0.5) * maxOffset
    };
  }

  // Circular packing algorithm for cylinders
  findCircularPackingPosition(item) {
    const radius = item.dimensions.diameter / 2000; // Convert to meters
    const containerRadius = Math.min(this.container.length, this.container.width) / 2000;

    // Try concentric circles from center outward
    for (let ring = 0; ring < 10; ring++) {
      const ringRadius = ring * radius * 2.2; // 10% spacing between cylinders
      
      if (ringRadius + radius > containerRadius) break;

      const circumference = 2 * Math.PI * ringRadius;
      const itemsInRing = Math.floor(circumference / (radius * 2.2));

      for (let i = 0; i < itemsInRing; i++) {
        const angle = (2 * Math.PI * i) / itemsInRing;
        const position = {
          x: this.container.length / 2000 + ringRadius * Math.cos(angle),
          y: 0.1, // Slight elevation from truck bed
          z: this.container.width / 2000 + ringRadius * Math.sin(angle)
        };

        if (this.validatePosition(item, position)) {
          return position;
        }
      }
    }

    return null;
  }

  // Find position for horizontal cylinders
  findHorizontalPosition(item) {
    const length = item.dimensions.height / 1000; // Length when horizontal
    const diameter = item.dimensions.diameter / 1000;

    // Try to place along the length of the truck
    for (let x = diameter / 2; x < this.container.length / 1000 - length / 2; x += diameter * 1.1) {
      for (let z = diameter / 2; z < this.container.width / 1000 - diameter / 2; z += diameter * 1.1) {
        const position = {
          x: x,
          y: diameter / 2, // Resting on truck bed
          z: z
        };

        if (this.validatePosition(item, position)) {
          return position;
        }
      }
    }

    return null;
  }

  // Calculate support wedges for horizontal cylinders
  calculateSupportWedges(item, position) {
    const diameter = item.dimensions.diameter / 1000;
    const wedgeHeight = diameter * 0.3; // 30% of diameter
    
    return [
      {
        type: 'wedge',
        position: {
          x: position.x - item.dimensions.height / 2000,
          y: 0,
          z: position.z
        },
        dimensions: {
          width: 100, // 100mm wedge
          height: wedgeHeight * 1000,
          length: 200
        }
      },
      {
        type: 'wedge',
        position: {
          x: position.x + item.dimensions.height / 2000,
          y: 0,
          z: position.z
        },
        dimensions: {
          width: 100,
          height: wedgeHeight * 1000,
          length: 200
        }
      }
    ];
  }

  // Validate position doesn't conflict with existing items
  validatePosition(item, position) {
    const itemBounds = this.calculateItemBounds(item, position);

    // Check container bounds
    if (!this.isWithinContainer(itemBounds)) {
      return false;
    }

    // Check collision with existing items
    for (const existingItem of [...this.packedItems, ...this.existingItems]) {
      const existingBounds = this.calculateItemBounds(existingItem, existingItem.position);
      if (this.checkCollision(itemBounds, existingBounds)) {
        return false;
      }
    }

    return true;
  }

  // Calculate 3D bounds for cylindrical items
  calculateItemBounds(item, position) {
    if (item.orientation === 'horizontal') {
      return {
        minX: position.x - item.dimensions.height / 2000,
        maxX: position.x + item.dimensions.height / 2000,
        minY: position.y - item.dimensions.diameter / 2000,
        maxY: position.y + item.dimensions.diameter / 2000,
        minZ: position.z - item.dimensions.diameter / 2000,
        maxZ: position.z + item.dimensions.diameter / 2000
      };
    } else {
      return {
        minX: position.x - item.dimensions.diameter / 2000,
        maxX: position.x + item.dimensions.diameter / 2000,
        minY: position.y,
        maxY: position.y + item.dimensions.height / 1000,
        minZ: position.z - item.dimensions.diameter / 2000,
        maxZ: position.z + item.dimensions.diameter / 2000
      };
    }
  }

  // Check if bounds are within container
  isWithinContainer(bounds) {
    return bounds.minX >= 0 && bounds.maxX <= this.container.length / 1000 &&
           bounds.minY >= 0 && bounds.maxY <= this.container.height / 1000 &&
           bounds.minZ >= 0 && bounds.maxZ <= this.container.width / 1000;
  }

  // Check 3D collision between two items
  checkCollision(bounds1, bounds2) {
    return !(bounds1.maxX < bounds2.minX || bounds1.minX > bounds2.maxX ||
             bounds1.maxY < bounds2.minY || bounds1.minY > bounds2.maxY ||
             bounds1.maxZ < bounds2.minZ || bounds1.minZ > bounds2.maxZ);
  }

  // Validate nesting position
  validateNestingPosition(item, position) {
    // Check if position is valid and item fits within base item
    return this.validatePosition(item, position);
  }

  // Sort items by diameter for optimal packing
  sortByDiameter(items) {
    return items.sort((a, b) => b.dimensions.diameter - a.dimensions.diameter);
  }

  createPackedItem(item, position) {
    const packedItem = {
      ...item,
      position,
      packedAt: new Date().toISOString(),
      stability: this.calculateStability(item, position)
    };
    
    this.packedItems.push(packedItem);
    return packedItem;
  }

  calculateStability(item, position) {
    let stabilityScore = 100;

    // Reduce score for horizontal cylinders without support
    if (item.orientation === 'horizontal' && position.y > 0.1) {
      stabilityScore -= 30;
    }

    // Reduce score for fragile items
    if (item.fragile) {
      stabilityScore -= 20;
    }

    // Increase score for nested items
    if (item.nesting && this.isNested(item, position)) {
      stabilityScore += 20;
    }

    return Math.max(0, Math.min(100, stabilityScore));
  }

  isNested(item, position) {
    // Check if item is nested within another cylinder
    return this.packedItems.some(packedItem => 
      packedItem.materialType === 'cylindrical' &&
      packedItem.dimensions.diameter > item.dimensions.diameter &&
      this.isPositionWithin(position, packedItem.position, packedItem.dimensions)
    );
  }

  isPositionWithin(position, containerPos, containerDims) {
    const distance = Math.sqrt(
      Math.pow(position.x - containerPos.x, 2) + 
      Math.pow(position.z - containerPos.z, 2)
    );
    return distance < (containerDims.diameter / 2000) && 
           position.y >= containerPos.y;
  }
}
