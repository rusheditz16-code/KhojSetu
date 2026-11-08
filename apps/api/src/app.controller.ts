import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('health')
  getHealth() {
    return {
      status: 'healthy',
      service: 'KhojSetu NestJS API (FoundBeacon)',
      timestamp: new Date().toISOString(),
      architecture: {
        framework: 'NestJS + TypeScript',
        orm: 'Prisma + PostgreSQL',
        backgroundJobs: 'Redis + BullMQ',
        storage: 'S3-Compatible Object Storage',
        geospatial: 'PostGIS Approximate Distance Ranking',
        telemetry: 'OpenTelemetry Spans & Metrics',
      },
    };
  }

  @Get('api/config')
  getConfig() {
    return {
      appName: 'KhojSetu / FoundBeacon',
      tagline: 'Modern TypeScript Campus Lost & Found Bridge with PostGIS, BullMQ, and OpenTelemetry',
      categories: [
        { id: 'electronics', label: 'Electronics & Gadgets' },
        { id: 'id_cards', label: 'ID Cards & Badges' },
        { id: 'wallets_bags', label: 'Wallets, Purses & Bags' },
        { id: 'keys', label: 'Keys & Keychains' },
        { id: 'clothing', label: 'Clothing & Jackets' },
        { id: 'books', label: 'Books & Stationery' },
        { id: 'bottles', label: 'Bottles & Mugs' },
        { id: 'other', label: 'Other Miscellaneous' },
      ],
      campusZones: [
        { id: 'library', name: 'Central Library' },
        { id: 'eng_block', name: 'Engineering Block' },
        { id: 'science_block', name: 'Science Complex' },
        { id: 'cafeteria', name: 'Student Cafeteria' },
        { id: 'sports_complex', name: 'Sports Complex' },
        { id: 'hostels', name: 'Hostel Quads' },
        { id: 'admin_building', name: 'Admin Building' },
        { id: 'other', name: 'Other Campus Area' },
      ],
    };
  }
}
