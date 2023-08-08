import { Test, TestingModule } from '@nestjs/testing';
import { BillRemindersService } from './bill_reminders.service';

describe('BillRemindersService', () => {
  let service: BillRemindersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BillRemindersService],
    }).compile();

    service = module.get<BillRemindersService>(BillRemindersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
