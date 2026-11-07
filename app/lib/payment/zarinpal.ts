/**
 * Zarinpal payment gateway (REST v4).
 *
 * Configuration (env):
 *   ZARINPAL_MERCHANT_ID  36-character merchant id (required for real payments)
 *   ZARINPAL_SANDBOX      "true" to use sandbox.zarinpal.com
 *   PAYMENT_DEV_FAKE      "true" (development only) to skip the gateway
 *                         entirely and simulate a successful payment
 *
 * Amounts passed in are Toman; Zarinpal's default currency is Rial, so they
 * are multiplied by 10 on the wire.
 */

export const GATEWAY_NAME = 'zarinpal';

const isProd = process.env.NODE_ENV === 'production';

function baseUrl(): string {
  return process.env.ZARINPAL_SANDBOX === 'true'
    ? 'https://sandbox.zarinpal.com'
    : 'https://payment.zarinpal.com';
}

function fakeMode(): boolean {
  return !isProd && process.env.PAYMENT_DEV_FAKE === 'true';
}

export function gatewayConfigured(): boolean {
  return fakeMode() || Boolean(process.env.ZARINPAL_MERCHANT_ID);
}

type RequestResult =
  | { ok: true; authority: string; redirectUrl: string }
  | { ok: false; message: string };

type VerifyResult =
  | { ok: true; refId: string; cardPan: string | null; alreadyVerified: boolean; raw: unknown }
  | { ok: false; code: number | null; message: string; raw: unknown };

interface ZarinpalResponse {
  data?: { code?: number; authority?: string; ref_id?: number | string; card_pan?: string; message?: string } | [];
  errors?: { code?: number; message?: string } | [];
}

async function post(path: string, body: Record<string, unknown>): Promise<ZarinpalResponse> {
  const res = await fetch(`${baseUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  });
  return (await res.json().catch(() => ({}))) as ZarinpalResponse;
}

function dataOf(r: ZarinpalResponse) {
  return r.data && !Array.isArray(r.data) ? r.data : undefined;
}
function errorOf(r: ZarinpalResponse) {
  return r.errors && !Array.isArray(r.errors) ? r.errors : undefined;
}

/** Ask the gateway for a payment authority and the URL to send the buyer to. */
export async function requestPayment(input: {
  amountToman: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string | null;
  orderId?: string;
}): Promise<RequestResult> {
  if (fakeMode()) {
    const authority = `DEV${Date.now()}${Math.floor(Math.random() * 1e6)}`;
    const url = new URL(input.callbackUrl);
    url.searchParams.set('Authority', authority);
    url.searchParams.set('Status', 'OK');
    return { ok: true, authority, redirectUrl: url.toString() };
  }

  const merchant = process.env.ZARINPAL_MERCHANT_ID;
  if (!merchant) return { ok: false, message: 'درگاه پرداخت پیکربندی نشده است.' };

  try {
    const r = await post('/pg/v4/payment/request.json', {
      merchant_id: merchant,
      amount: input.amountToman * 10,
      callback_url: input.callbackUrl,
      description: input.description.slice(0, 255),
      metadata: {
        ...(input.mobile ? { mobile: input.mobile } : {}),
        ...(input.email ? { email: input.email } : {}),
        ...(input.orderId ? { order_id: input.orderId } : {}),
      },
    });
    const data = dataOf(r);
    if (data?.code === 100 && data.authority) {
      return {
        ok: true,
        authority: data.authority,
        redirectUrl: `${baseUrl()}/pg/StartPay/${data.authority}`,
      };
    }
    const err = errorOf(r);
    console.error('[zarinpal] request failed', err ?? r);
    return { ok: false, message: 'اتصال به درگاه پرداخت ناموفق بود؛ دوباره تلاش کنید.' };
  } catch (e) {
    console.error('[zarinpal] request error', e);
    return { ok: false, message: 'اتصال به درگاه پرداخت ناموفق بود؛ دوباره تلاش کنید.' };
  }
}

/** Confirm a payment after the buyer returns from the gateway. */
export async function verifyPayment(input: { amountToman: number; authority: string }): Promise<VerifyResult> {
  if (fakeMode()) {
    return { ok: true, refId: `DEV-${input.authority.slice(-8)}`, cardPan: null, alreadyVerified: false, raw: { fake: true } };
  }

  const merchant = process.env.ZARINPAL_MERCHANT_ID;
  if (!merchant) return { ok: false, code: null, message: 'درگاه پرداخت پیکربندی نشده است.', raw: null };

  try {
    const r = await post('/pg/v4/payment/verify.json', {
      merchant_id: merchant,
      amount: input.amountToman * 10,
      authority: input.authority,
    });
    const data = dataOf(r);
    if (data && (data.code === 100 || data.code === 101) && data.ref_id !== undefined) {
      return {
        ok: true,
        refId: String(data.ref_id),
        cardPan: data.card_pan ?? null,
        alreadyVerified: data.code === 101,
        raw: r,
      };
    }
    const err = errorOf(r);
    return {
      ok: false,
      code: err?.code ?? data?.code ?? null,
      message: err?.message ?? data?.message ?? 'پرداخت تأیید نشد.',
      raw: r,
    };
  } catch (e) {
    console.error('[zarinpal] verify error', e);
    return { ok: false, code: null, message: 'خطا در ارتباط با درگاه هنگام تأیید پرداخت.', raw: null };
  }
}
