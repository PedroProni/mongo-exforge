/*
EXAMPLE USE CASE

import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class ExampleUseCase {
    constructor(
        @Inject(EXAMPLE_INJECT_TOKEN)
        private readonly exampleRepository: ExampleRepository,
    ) { }

    async execute(command: ExampleRuleCommand): Promise<any> {
        const example = new ExampleEntity({
            _id: '',
            name: command.name,
            description: command.description,
        });

        return this.exampleRepository.create(example);
    };
} 
*/