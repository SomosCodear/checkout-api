import { Application, Operation } from "@joelalejandro/jsonapi-ts";
import { existsSync, readFileSync, writeFileSync } from "fs";
import Jimp from "jimp";
import { Context } from "koa";
import { resolve as resolvePath } from "path";
import * as qr from "qr-image";

import CustomerProcessor from "../resources/customer/processor";
import Customer from "../resources/customer/resource";
import PurchaseProcessor from "../resources/purchase/processor";
import Purchase from "../resources/purchase/resource";
import TicketProcessor from "../resources/ticket/processor";
import Ticket from "../resources/ticket/resource";

import centerLine from "../utils/graphics/center-line";
import centerPosition from "../utils/graphics/center-position";
import BitmapFonts from "../utils/graphics/fonts";
import {
  textLinesWithShadow,
  textLineWithShadow
} from "../utils/graphics/text-with-shadow";
import wordWrap from "../utils/graphics/word-wrap";

const ticketAsQRString = (
  ticket: Ticket,
  customer: Customer,
  purchase: Purchase
) =>
  [
    customer.attributes.fullName,
    `${customer.attributes.identificationType} ${
      customer.attributes.identificationNumber
    }`,
    ticket.id,
    purchase.attributes.status
  ].join("\n");

const createQR = async (
  ticket: Ticket,
  customer: Customer,
  purchase: Purchase
): Promise<Jimp> => {
  const qrString = ticketAsQRString(ticket, customer, purchase);

  const qrImage = qr.imageSync(qrString, {
    ec_level: "H",
    type: "png",
    size: 6,
    margin: 0
  });

  return Jimp.read(qrImage as Buffer);
};

const getTexts = async (customer: Customer, ticketImage: Jimp) => {
  const title = await wordWrap({
    text: customer.attributes.fullName.toString().toUpperCase(),
    canvasWidth: ticketImage.getWidth(),
    lineHeight: 52,
    xBoundary: 300,
    yStart: 310,
    font: BitmapFonts.Title
  });
  const subtitle = await centerLine({
    text: `${customer.attributes.identificationType} ${
      customer.attributes.identificationNumber
    }`,
    canvasWidth: ticketImage.getWidth(),
    yStart: 520,
    font: BitmapFonts.Subtitle
  });

  return { title, subtitle };
};

const renderTicket = async (
  ticket: Ticket,
  customer: Customer,
  purchase: Purchase
) => {
  const ticketImage = await Jimp.read(
    resolvePath(__dirname, "../assets/ticket-background@3x.png")
  );
  const logo = await Jimp.read(resolvePath(__dirname, "../assets/logo@3x.png"));
  const qrImage = await createQR(ticket, customer, purchase);
  const { title, subtitle } = await getTexts(customer, ticketImage);
  await Promise.all([
    // Render ticket owner's name
    textLinesWithShadow({
      image: ticketImage,
      lines: title,
      textFont: BitmapFonts.Title,
      shadowFont: BitmapFonts.TitleShadow
    }),
    // Render ticket owner's personal ID
    textLineWithShadow({
      image: ticketImage,
      line: subtitle,
      textFont: BitmapFonts.Subtitle,
      shadowFont: BitmapFonts.SubtitleShadow
    }),
    // Overlap QR code
    ticketImage.composite(
      qrImage,
      centerPosition(ticketImage.getWidth(), qrImage.getWidth()),
      712,
      {
        mode: Jimp.BLEND_MULTIPLY,
        opacitySource: 1,
        opacityDest: 1
      }
    ),
    // Overlap WebConf brand on top of QR code
    ticketImage.composite(
      logo,
      centerPosition(ticketImage.getWidth(), logo.getWidth()),
      716 + qrImage.getHeight() / 4
    )
  ]);

  return ticketImage;
};

export default (application: Application) => {
  const ticketProcessor = application.processorFor({
    ref: { type: "Ticket", id: "", lid: "", relationship: "" }
  } as Operation) as TicketProcessor;

  const customerProcessor = application.processorFor({
    ref: { type: "Customer", id: "", lid: "", relationship: "" }
  } as Operation) as CustomerProcessor;

  const purchaseProcessor = application.processorFor({
    ref: { type: "Purchase", id: "", lid: "", relationship: "" }
  } as Operation) as PurchaseProcessor;

  const getTicketData = async (
    ticketID: string
  ): Promise<{ ticket: Ticket; customer: Customer; purchase: Purchase }> => {
    const ticket = await ticketProcessor.getById(ticketID);
    const customer = await customerProcessor.getById(
      ticket.relationships.customer.data.id
    );
    const purchase = await purchaseProcessor.getById(
      ticket.relationships.purchase.data.id
    );

    return { ticket, customer, purchase };
  };

  return async function getETicket(ctx: Context, next: () => Promise<void>) {
    if (!ctx.request.url.includes("/e-ticket")) {
      return next();
    }

    ctx.set("Content-Type", Jimp.MIME_PNG);

    // Check if we've already generated this ticket. If we've done so,
    // use the file cache for quicker response time.
    const ticketID = ctx.request.query.id;
    const ticketFile = resolvePath(__dirname, `../../tickets/${ticketID}.png`);

    if (existsSync(ticketFile)) {
      ctx.body = readFileSync(ticketFile);
      return;
    }

    // Create a new ticket image and save it.
    const { ticket, customer, purchase } = await getTicketData(ticketID);
    const ticketImage = await renderTicket(ticket, customer, purchase);
    const ticketBinary = await ticketImage.getBufferAsync(Jimp.MIME_PNG);

    writeFileSync(ticketFile, ticketBinary);

    ctx.body = ticketBinary;
  };
};
