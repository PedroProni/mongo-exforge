/*
Example Controller


import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Put, Query } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Example')
@Controller('example')
export class ExampleController {
    constructor(
        private readonly exampleUseCase: ExampleUseCase,
    ) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() exampleDto: ExampleDto) {
        const command = ApplicationExampleMapper.toExampleCommand(exampleDto);
        return await this.exampleUseCase.execute(command);
    }
}
*/