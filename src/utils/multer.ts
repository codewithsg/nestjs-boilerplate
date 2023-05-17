import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const multerConfig = (filePath: string) => ({
  fileFilter: imageFilter,
  storage: diskStorage({
    destination: `./public/${filePath}`,
    filename: (req, file, callback) => {
      const name = Date.now() + extname(file.originalname);
      console.log('here1');
      callback(null, name);
    },
  }),
});

function imageFilter(req, file, callback) {
  console.log('here2');
  if (file.mimetype.split('/')[0] !== 'image') {
    return callback(new BadRequestException('Only image files are allowed'));
  }
  callback(null, true);
}
