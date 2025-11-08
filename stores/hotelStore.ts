
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Hotel, Guest, Room, RoomCategory, Stay, Staff, WifiCredential } from '../types'

export const useHotelStore = defineStore('hotel', () => {
  const hotel = ref<Hotel>({
    id: 1,
    name: 'Grand Vista Hotel',
    description: 'A luxury hotel experience in the heart of the city',
    address: '123 Main Street',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    pincode: '10001',
    phone: '+1-555-0123',
    email: 'info@grandvista.com',
    check_in_time: '14:00',
    time_zone: 'America/New_York',
    wifi_password: 'GrandVista2024',
    status: 'verified',
    documents: []
  })

  const guests = ref<Guest[]>([
    {
      id: 1,
      full_name: 'John Smith',
      whatsapp_number: '+1-555-1001',
      email: 'john.smith@email.com',
      date_of_birth: '1985-03-15',
      nationality: 'USA',
      number_of_guests: 2,
      guest_names: ['John Smith', 'Jane Smith'],
      identity_documents: [
        {
          id: 1,
          document_type: 'passport',
          document_number: 'P123456789',
          front_image: 'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg',
          verified: true
        }
      ]
    },
    {
      id: 2,
      full_name: 'Emily Johnson',
      whatsapp_number: '+1-555-1002',
      email: 'emily.j@email.com',
      date_of_birth: '1990-07-22',
      nationality: 'Canada',
      number_of_guests: 1,
      guest_names: ['Emily Johnson'],
      identity_documents: [
        {
          id: 2,
          document_type: 'drivers_license',
          document_number: 'DL987654',
          front_image: 'https://images.pexels.com/photos/5011647/pexels-photo-5011647.jpeg',
          verified: true
        }
      ]
    }
  ])

  const roomCategories = ref<RoomCategory[]>([
    {
      id: 1,
      name: 'Deluxe Room',
      description: 'Spacious room with city view',
      base_price: 150,
      max_occupancy: 2,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar']
    },
    {
      id: 2,
      name: 'Executive Suite',
      description: 'Luxurious suite with premium amenities',
      base_price: 300,
      max_occupancy: 4,
      amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Kitchenette']
    },
    {
      id: 3,
      name: 'Standard Room',
      description: 'Comfortable room with essential amenities',
      base_price: 100,
      max_occupancy: 2,
      amenities: ['WiFi', 'TV', 'Air Conditioning']
    }
  ])

  const rooms = ref<Room[]>([
    { id: 1, room_number: '101', floor: 1, category: roomCategories.value[2], status: 'available' },
    { id: 2, room_number: '102', floor: 1, category: roomCategories.value[2], status: 'occupied' },
    { id: 3, room_number: '103', floor: 1, category: roomCategories.value[0], status: 'cleaning' },
    { id: 4, room_number: '104', floor: 1, category: roomCategories.value[0], status: 'available' },
    { id: 5, room_number: '201', floor: 2, category: roomCategories.value[0], status: 'occupied' },
    { id: 6, room_number: '202', floor: 2, category: roomCategories.value[0], status: 'available' },
    { id: 7, room_number: '203', floor: 2, category: roomCategories.value[1], status: 'maintenance' },
    { id: 8, room_number: '204', floor: 2, category: roomCategories.value[1], status: 'available' },
    { id: 9, room_number: '301', floor: 3, category: roomCategories.value[1], status: 'available' },
    { id: 10, room_number: '302', floor: 3, category: roomCategories.value[1], status: 'available' }
  ])

  const stays = ref<Stay[]>([
    {
      id: 1,
      guest: guests.value[0],
      room: rooms.value[1],
      check_in_date: new Date().toISOString(),
      check_out_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      expected_check_in_date: new Date().toISOString(),
      status: 'active',
      identity_verified: true
    },
    {
      id: 2,
      guest: guests.value[1],
      room: rooms.value[4],
      check_in_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      check_out_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      expected_check_in_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      identity_verified: true
    },
    {
      id: 3,
      guest: {
        id: 3,
        full_name: 'Michael Brown',
        whatsapp_number: '+1-555-1003',
        email: 'michael.b@email.com',
        date_of_birth: '1988-11-10',
        nationality: 'UK',
        number_of_guests: 2,
        guest_names: ['Michael Brown', 'Sarah Brown'],
        identity_documents: []
      },
      room: rooms.value[7],
      check_in_date: '',
      check_out_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      expected_check_in_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending',
      identity_verified: false
    }
  ])

  const staff = ref<Staff[]>([
    {
      id: 1,
      username: 'admin',
      email: 'admin@grandvista.com',
      user_type: 'hotel_admin',
      phone_number: '+1-555-0100',
      is_active_hotel_user: true,
      department: []
    },
    {
      id: 2,
      username: 'manager1',
      email: 'manager@grandvista.com',
      user_type: 'manager',
      phone_number: '+1-555-0101',
      is_active_hotel_user: true,
      department: []
    },
    {
      id: 3,
      username: 'receptionist1',
      email: 'receptionist@grandvista.com',
      user_type: 'receptionist',
      phone_number: '+1-555-0102',
      is_active_hotel_user: true,
      department: []
    }
  ])

  const wifiCredentials = ref<WifiCredential[]>([
    {
      id: 1,
      network_name: 'GrandVista-Guest',
      password: 'Welcome2024',
      floor: 1,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      network_name: 'GrandVista-Premium',
      password: 'Premium2024',
      room_category: 'Executive Suite',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ])

  const activeStays = computed(() => stays.value.filter(stay => stay.status === 'active'))
  const pendingStays = computed(() => stays.value.filter(stay => stay.status === 'pending'))
  const floors = computed(() => [...new Set(rooms.value.map(room => room.floor))].sort())

  const getRoomsByFloor = (floor: number) => rooms.value.filter(room => room.floor === floor)
  const getAvailableRooms = () => rooms.value.filter(room => room.status === 'available')

  const addGuest = (guest: Omit<Guest, 'id'>) => {
    const newGuest = { ...guest, id: guests.value.length + 1 }
    guests.value.push(newGuest)
    return newGuest
  }

  const addStay = (stay: Omit<Stay, 'id'>) => {
    const newStay = { ...stay, id: stays.value.length + 1 }
    stays.value.push(newStay)
    return newStay
  }

  const checkIn = (stayId: number, roomId: number) => {
    const stay = stays.value.find(s => s.id === stayId)
    const room = rooms.value.find(r => r.id === roomId)
    if (stay && room) {
      stay.status = 'active'
      stay.room = room
      stay.check_in_date = new Date().toISOString()
      room.status = 'occupied'
    }
  }

  const checkOut = (stayId: number) => {
    const stay = stays.value.find(s => s.id === stayId)
    if (stay) {
      stay.status = 'completed'
      const room = rooms.value.find(r => r.id === stay.room.id)
      if (room) {
        room.status = 'cleaning'
      }
    }
  }

  const updateRoomStatus = (roomId: number, status: Room['status']) => {
    const room = rooms.value.find(r => r.id === roomId)
    if (room) {
      room.status = status
    }
  }

  const addStaffMember = (staffMember: Omit<Staff, 'id'>) => {
    const newStaff = { ...staffMember, id: staff.value.length + 1 }
    staff.value.push(newStaff)
    return newStaff
  }

  const updateStaffMember = (id: number, updates: Partial<Staff>) => {
    const index = staff.value.findIndex(s => s.id === id)
    if (index !== -1) {
      staff.value[index] = { ...staff.value[index], ...updates }
    }
  }

  const deleteStaffMember = (id: number) => {
    staff.value = staff.value.filter(s => s.id !== id)
  }

  return {
    hotel,
    guests,
    rooms,
    roomCategories,
    stays,
    staff,
    wifiCredentials,
    activeStays,
    pendingStays,
    floors,
    getRoomsByFloor,
    getAvailableRooms,
    addGuest,
    addStay,
    checkIn,
    checkOut,
    updateRoomStatus,
    addStaffMember,
    updateStaffMember,
    deleteStaffMember
  }
})
