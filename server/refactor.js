const fs = require('fs');
let code = fs.readFileSync('src/app.service.ts', 'utf8');

// Imports
code = code.replace(/import \{ InjectRepository \} from '@nestjs\/typeorm';/g, "import { InjectModel } from '@nestjs/mongoose';");
code = code.replace(/import \{ Repository \} from 'typeorm';/g, "import { Model } from 'mongoose';");
code = code.replace(/database\/entities/g, 'database/schemas');

// Remove "Entity" suffix from classes
code = code.replace(/([A-Z][a-zA-Z]+)Entity/g, '$1');

// Injectors
code = code.replace(/@InjectRepository\(([A-Za-z]+)\) private ([a-zA-Z]+)Repo: Repository<\1>/g, '@InjectModel($1.name) private $2Model: Model<$1>');

// Property names
code = code.replace(/([a-zA-Z]+)Repo/g, '$1Model');

// Queries
code = code.replace(/\.count\(\)/g, '.countDocuments().exec()');
code = code.replace(/\.save\(\[/g, '.insertMany([');
code = code.replace(/\.save\(([^\[].*?)\)/g, '.create($1)');
code = code.replace(/\.find\(\)/g, '.find().exec()');
code = code.replace(/\.findOneBy\(\{ id \}\)/g, '.findById(id).exec()');
code = code.replace(/\.findOneBy\(\{ id: ([a-zA-Z]+) \}\)/g, '.findById($1).exec()');
code = code.replace(/\.update\(([^,]+), ([^\)]+)\)/g, '.findByIdAndUpdate($1, $2, { new: true }).exec()');
code = code.replace(/\.delete\(([^)]+)\)/g, '.findByIdAndDelete($1).exec()');

fs.writeFileSync('src/app.service.ts', code);
console.log('Refactor complete');
