import { defineStore } from 'pinia';

export interface RoomCategory {
  id: number;
  name: string;
  description: string;
  base_price: number;
  max_occupancy: number;
  amenities: string[];
}

export interface Room {
  id: number;
  room_number: string;
  category_id: number;
  floor: number;
  status: 'available' | 'occupied' | 'cleaning' | 'maintenance' | 'out_of_order';
}

export interface BulkAddForm {
  startRoomNumber: number;
  endRoomNumber: number;
  floor: number;
  categoryId: number;
}

export const useRoomStore = defineStore('room', {
  state: () => ({
    categories: [
      {
        id: 1,
        name: 'Standard',
        description: 'Comfortable rooms with essential amenities',
        base_price: 120,
        max_occupancy: 2,
        amenities: ['WiFi', 'TV', 'Mini Fridge', 'Coffee Maker']
      },
      {
        id: 2,
        name: 'Deluxe',
        description: 'Spacious rooms with premium amenities and city view',
        base_price: 180,
        max_occupancy: 3,
        amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Coffee Maker', 'Balcony', 'Room Service']
      },
      {
        id: 3,
        name: 'Suite',
        description: 'Luxury suites with separate living areas',
        base_price: 350,
        max_occupancy: 4,
        amenities: ['WiFi', 'Smart TV', 'Mini Bar', 'Coffee Maker', 'Balcony', 'Room Service', 'Jacuzzi']
      }
    ] as RoomCategory[],
    
    rooms: [
      { id: 1, room_number: '101', category_id: 1, floor: 1, status: 'available' },
      { id: 2, room_number: '102', category_id: 1, floor: 1, status: 'occupied' },
      { id: 3, room_number: '103', category_id: 2, floor: 1, status: 'available' },
      { id: 4, room_number: '104', category_id: 2, floor: 1, status: 'cleaning' },
      { id: 5, room_number: '105', category_id: 3, floor: 1, status: 'available' },
      { id: 6, room_number: '201', category_id: 1, floor: 2, status: 'available' },
      { id: 7, room_number: '202', category_id: 1, floor: 2, status: 'maintenance' },
      { id: 8, room_number: '203', category_id: 2, floor: 2, status: 'available' },
      { id: 9, room_number: '204', category_id: 2, floor: 2, status: 'occupied' },
      { id: 10, room_number: '205', category_id: 3, floor: 2, status: 'available' },
      { id: 11, room_number: '301', category_id: 1, floor: 3, status: 'available' },
      { id: 12, room_number: '302', category_id: 1, floor: 3, status: 'available' },
      { id: 13, room_number: '303', category_id: 2, floor: 3, status: 'out_of_order' },
      { id: 14, room_number: '304', category_id: 2, floor: 3, status: 'available' },
      { id: 15, room_number: '305', category_id: 3, floor: 3, status: 'occupied' },
    ] as Room[],
    
    selectedRooms: [] as number[],
    selectedFloor: 1,
  }),
  
  getters: {
    floorOptions: (state) => {
      const floors = new Set(state.rooms.map(room => room.floor));
      return Array.from(floors)
        .sort((a, b) => a - b)
        .map(floor => ({ label: `Floor ${floor}`, value: floor }));
    },
    
    roomsOnSelectedFloor: (state) => {
      return state.rooms
        .filter(room => room.floor === state.selectedFloor)
        .sort((a, b) => a.room_number.localeCompare(b.room_number));
    },
    
    getCategoryName: (state) => {
      return (categoryId: number) => {
        const category = state.categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Unknown';
      };
    },
    
    getRoomCountByCategory: (state) => {
      return (categoryId: number) => {
        return state.rooms.filter(room => room.category_id === categoryId).length;
      };
    },
    
    getStatusSeverity: () => {
      return (status: string) => {
        const severityMap: Record<string, string> = {
          'available': 'success',
          'occupied': 'info',
          'cleaning': 'warning',
          'maintenance': 'warning',
          'out_of_order': 'danger'
        };
        return severityMap[status] || 'secondary';
      };
    },
    
    selectedRoomCount: (state) => {
      return state.selectedRooms.length;
    },
  },
  
  actions: {
    // Category actions
    addCategory(category: Omit<RoomCategory, 'id'>) {
      const newId = this.categories.length > 0 
        ? Math.max(...this.categories.map(c => c.id)) + 1 
        : 1;
      
      this.categories.push({
        id: newId,
        ...category
      });
    },
    
    updateCategory(id: number, category: Partial<RoomCategory>) {
      const index = this.categories.findIndex(c => c.id === id);
      if (index !== -1) {
        this.categories[index] = {
          ...this.categories[index],
          ...category
        };
      }
    },
    
    deleteCategory(id: number) {
      this.categories = this.categories.filter(c => c.id !== id);
      // Also delete all rooms in this category
      this.rooms = this.rooms.filter(r => r.category_id !== id);
    },
    
    // Room actions
    addRoom(room: Omit<Room, 'id'>) {
      const newId = this.rooms.length > 0 
        ? Math.max(...this.rooms.map(r => r.id)) + 1 
        : 1;
      
      this.rooms.push({
        id: newId,
        ...room
      });
    },
    
    updateRoom(id: number, room: Partial<Room>) {
      const index = this.rooms.findIndex(r => r.id === id);
      if (index !== -1) {
        this.rooms[index] = {
          ...this.rooms[index],
          ...room
        };
      }
    },
    
    deleteRoom(id: number) {
      this.rooms = this.rooms.filter(r => r.id !== id);
      // Also remove from selected rooms if it was selected
      this.selectedRooms = this.selectedRooms.filter(roomId => roomId !== id);
    },
    
    // Bulk room actions
    bulkAddRooms(form: BulkAddForm) {
      const maxId = this.rooms.length > 0 
        ? Math.max(...this.rooms.map(r => r.id)) 
        : 0;
      
      for (let i = form.startRoomNumber; i <= form.endRoomNumber; i++) {
        const roomNumber = `${form.floor}${i.toString().padStart(2, '0')}`;
        
        // Check if room already exists
        const exists = this.rooms.some(r => r.room_number === roomNumber);
        if (!exists) {
          this.rooms.push({
            id: maxId + (i - form.startRoomNumber) + 1,
            room_number: roomNumber,
            category_id: form.categoryId,
            floor: form.floor,
            status: 'available'
          });
        }
      }
    },
    
    updateSelectedRoomsStatus(status: Room['status']) {
      this.rooms = this.rooms.map(room => {
        if (this.selectedRooms.includes(room.id)) {
          return {
            ...room,
            status
          };
        }
        return room;
      });
    },
    
    deleteSelectedRooms() {
      this.rooms = this.rooms.filter(r => !this.selectedRooms.includes(r.id));
      this.selectedRooms = [];
    },
    
    // Selection actions
    toggleRoomSelection(roomId: number) {
      const index = this.selectedRooms.indexOf(roomId);
      if (index === -1) {
        this.selectedRooms.push(roomId);
      } else {
        this.selectedRooms.splice(index, 1);
      }
    },
    
    clearSelection() {
      this.selectedRooms = [];
    },
    
    selectRoom(roomId: number) {
      if (!this.selectedRooms.includes(roomId)) {
        this.selectedRooms = [roomId];
      }
    },
    
    // Floor actions
    setSelectedFloor(floor: number) {
      this.selectedFloor = floor;
    },
    
    addFloor() {
      const maxFloor = this.rooms.length > 0 
        ? Math.max(...this.rooms.map(r => r.floor)) 
        : 0;
      this.selectedFloor = maxFloor + 1;
    }
  }
});