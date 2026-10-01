import { publicMasters } from '@/server/products/public-service';
import { publicResponse } from '../../_response';

export async function GET() {
  return publicResponse(publicMasters);
}
