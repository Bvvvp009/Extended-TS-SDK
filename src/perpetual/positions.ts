/**
 * Position models
 */

import Decimal from 'decimal.js';
import { X10BaseModel } from '../utils/model';

/**
 * Exit type
 */
export enum ExitType {
  TRADE = 'TRADE',
  LIQUIDATION = 'LIQUIDATION',
  ADL = 'ADL',
}

/**
 * Position side
 */
export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT',
}

/**
 * Position status
 */
export enum PositionStatus {
  OPENED = 'OPENED',
  CLOSED = 'CLOSED',
}

/**
 * Position model
 */
export class PositionModel extends X10BaseModel {
  id: number;
  accountId: number;
  market: string;
  status: PositionStatus;
  side: PositionSide;
  leverage: Decimal;
  size: Decimal;
  value: Decimal;
  openPrice: Decimal;
  markPrice: Decimal;
  liquidationPrice?: Decimal;
  unrealisedPnl: Decimal;
  realisedPnl: Decimal;
  tpPrice?: Decimal;
  slPrice?: Decimal;
  adl?: number;
  createdAt: number;
  updatedAt: number;
}

/**
 * Realised PnL breakdown model
 */
export class RealisedPnlBreakdownModel extends X10BaseModel {
  tradePnl: Decimal;
  fundingFees: Decimal;
  openFees: Decimal;
  closeFees: Decimal;

  constructor(
    tradePnl: Decimal,
    fundingFees: Decimal,
    openFees: Decimal,
    closeFees: Decimal
  ) {
    super();
    this.tradePnl = tradePnl;
    this.fundingFees = fundingFees;
    this.openFees = openFees;
    this.closeFees = closeFees;
  }
}

/**
 * Position history model
 */
export class PositionHistoryModel extends X10BaseModel {
  id: number;
  accountId: number;
  market: string;
  side: PositionSide;
  size: Decimal;
  maxPositionSize: Decimal;
  leverage: Decimal;
  openPrice: Decimal;
  exitPrice?: Decimal;
  realisedPnl: Decimal;
  realisedPnlBreakdown: RealisedPnlBreakdownModel;
  createdTime: number;
  exitType?: ExitType;
  closedTime?: number;
}







