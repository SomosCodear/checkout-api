import { Application, Operation } from "@joelalejandro/jsonapi-ts";
import { existsSync, readFileSync, writeFileSync } from "fs";
import ical from "ical-generator";
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
  textLine,
  textLines,
  textLinesWithShadow,
  textLineWithShadow
} from "../utils/graphics/text";
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
  purchase: Purchase,
  {
    standalone = false,
    addOwnerData = false
  }: { standalone?: boolean; addOwnerData?: boolean } = {}
): Promise<Jimp> => {
  const qrString = ticketAsQRString(ticket, customer, purchase);

  const qrImage = await Jimp.read(qr.imageSync(qrString, {
    ec_level: "H",
    type: "png",
    size: 6,
    margin: standalone ? 1 : 0
  }) as Buffer);

  if (standalone) {
    const logo = await Jimp.read(
      resolvePath(__dirname, "../assets/logo-bw@3x.png")
    );
    await qrImage.composite(
      logo,
      centerPosition(qrImage.getWidth(), logo.getWidth()),
      centerPosition(qrImage.getHeight(), logo.getHeight())
    );

    if (addOwnerData) {
      const [qrWidth, qrHeight] = [qrImage.getWidth(), qrImage.getHeight()];
      const title = await wordWrap({
        text: customer.attributes.fullName.toString().toUpperCase(),
        canvasWidth: qrWidth,
        lineHeight: 40,
        xBoundary: qrWidth,
        yStart: qrHeight + 10,
        font: BitmapFonts.SubtitleShadow
      });

      title.push(
        await centerLine({
          canvasWidth: qrWidth,
          font: BitmapFonts.SubtitleShadow,
          text: `${customer.attributes.identificationType} ${
            customer.attributes.identificationNumber
          }`,
          yStart: title[title.length - 1].y + 40
        }),
        await centerLine({
          canvasWidth: qrWidth,
          font: BitmapFonts.SubtitleShadow,
          text: "OBISPO TREJO 323",
          yStart: title[title.length - 1].y + 80
        }),
        await centerLine({
          canvasWidth: qrWidth,
          font: BitmapFonts.SubtitleShadow,
          text: "11-05-2019",
          yStart: title[title.length - 1].y + 120
        })
      );

      const ownerImage = await Jimp.read(
        qrWidth,
        qrHeight + 10 + title.length * 40,
        "#ffffff"
      );

      await textLines({
        image: ownerImage,
        lines: title,
        textFont: BitmapFonts.SubtitleShadow
      });

      return ownerImage.composite(qrImage, 0, 0);
    }
  }

  return qrImage;
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

const createIcal = (ticket: Ticket) =>
  ical({
    prodId: {
      company: "WebConf",
      product: "Córdoba WebConf 2019",
      language: "ES"
    },
    domain: "https://webconf.tech",
    name: "Córdoba WebConf 2019",
    description: "Córdoba WebConf 2019",
    events: [
      {
        start: new Date("2019-05-11T09:00:00-03:00"),
        end: new Date("2019-05-11T18:00:00-03:00"),
        summary: "Córdoba WebConf 2019",
        url: `https://checkout.webconf.tech/e-ticket?id=${
          ticket.id
        }&format=ticket`,
        organizer: "WebConf <hola@webconf.tech>",
        status: "confirmed",
        geo: {
          lat: -31.419415,
          lon: -64.1890507
        }
      }
    ],
    method: "PUBLISH"
  });

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

    if (!ticket.id) {
      return {} as any;
    }

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

    const ticketID = ctx.request.query.id;
    const ticketFormat = ctx.request.query.format || "ticket"; // could also be "qr"
    const contentType =
      ticketFormat === "ical" ? "text/calendar" : Jimp.MIME_PNG;
    const extension = ticketFormat === "ical" ? "ics" : "png";

    ctx.set("Content-Type", contentType);

    if (!["ticket", "qr", "qr,owner", "ical"].includes(ticketFormat)) {
      ctx.status = 400;
      return;
    }

    const file = resolvePath(
      __dirname,
      `../../tickets/${ticketFormat}-${ticketID}.${extension}`
    );
    let image: Jimp;

    // Check if we've already generated this ticket. If we've done so,
    // use the file cache for quicker response time.
    if (existsSync(file)) {
      ctx.body = readFileSync(file);
      return;
    }

    const { ticket, customer, purchase } = await getTicketData(ticketID);

    if (!ticket) {
      ctx.status = 404;
      return;
    }

    if (ticketFormat === "ical") {
      const calendarEvent = createIcal(ticket);
      calendarEvent.saveSync(file);

      ctx.set("Content-Disposition", `inline;filename=ical-${ticket.id}.ics`);
      ctx.body = readFileSync(file);

      return;
    }

    if (ticketFormat === "qr") {
      image = await createQR(ticket, customer, purchase, { standalone: true });
    } else if (ticketFormat === "qr,owner") {
      image = await createQR(ticket, customer, purchase, {
        standalone: true,
        addOwnerData: true
      });
    } else if (ticketFormat === "ticket") {
      image = await renderTicket(ticket, customer, purchase);
    }

    const response = await image.getBufferAsync(Jimp.MIME_PNG);
    writeFileSync(file, response);

    ctx.body = response;
  };
};
