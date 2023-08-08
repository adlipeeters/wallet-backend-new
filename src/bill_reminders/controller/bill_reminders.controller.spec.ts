import { Test, TestingModule } from '@nestjs/testing';
import { BillRemindersController } from './bill_reminders.controller';

describe('BillRemindersController', () => {
  let controller: BillRemindersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillRemindersController],
    }).compile();

    controller = module.get<BillRemindersController>(BillRemindersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
