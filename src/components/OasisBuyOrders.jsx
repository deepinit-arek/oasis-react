import React, { PureComponent } from "react";
import { PropTypes } from "prop-types";
import styles from "./OasisBuyOrders.scss";
import CSSModules from "react-css-modules";
// import ImmutablePropTypes from 'react-immutable-proptypes';

import OasisWidgetFrame from "../containers/OasisWidgetFrame";
import OasisTable from "./OasisTable";
import { toDisplayFormat } from "../utils/orders";
import { LoadProgressSection } from "../utils/offers/loadProgress";
import { TAKE_BUY_OFFER } from "../store/reducers/offerTakes";
import { OFFER_STATUS_INACTIVE } from "../store/reducers/offers";
import { OasisSignificantDigitsWrapper } from "../containers/OasisSignificantDigits";
import { ETH_UNIT_ETHER } from '../constants';

const propTypes = PropTypes && {
  onSetOfferTakeModalOpen: PropTypes.func.isRequired,
  onSetActiveOfferTakeOfferId: PropTypes.func.isRequired,
  onCheckOfferIsActive: PropTypes.func.isRequired,
  onResetCompletedOfferCheck: PropTypes.func.isRequired
};

const defaultProps = {};

const actionsColumnTemplate = function() {
  return null;
};
const priceTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionAmount={row.bid_price_full_precision}
    amount={row.bid_price}
  />
);
const baseTokenTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionUnit={ETH_UNIT_ETHER}
    fullPrecisionAmount={row.buy_how_much_full_precision}
    amount={row.buy_how_much}
  />
);
const quoteTokenTemplate = row => (
  <OasisSignificantDigitsWrapper
    fullPrecisionUnit={ETH_UNIT_ETHER}
    fullPrecisionAmount={row.sell_how_much_full_precision}
    amount={row.sell_how_much}
  />
);

const colsDefinition = (baseToken, quoteToken, orderActions) => {
  return [
    { heading: `price`, template: priceTemplate },
    { heading: `${quoteToken}`, template: quoteTokenTemplate },
    { heading: `${baseToken}`, template: baseTokenTemplate },
    { heading: ``, template: actionsColumnTemplate.bind(orderActions) }
  ];
};

class OasisBuyOrders extends PureComponent {
  constructor(props) {
    super(props);
    this.onTableRowClick = this.onTableRowClick.bind(this);
  }

  onTableRowClick(rowData) {
    const {
      onSetOfferTakeModalOpen,
      onCheckOfferIsActive,
      onResetOfferTake
    } = this.props;
    onCheckOfferIsActive(rowData.id).then(
      isActive =>
        isActive === true
          ? onSetOfferTakeModalOpen({
              offerTakeType: TAKE_BUY_OFFER,
              offerId: rowData.id
            })
          : onResetOfferTake()
    );
  }

  render() {
    const {
      activeTradingPair: { baseToken, quoteToken },
      buyOffers = [],
      buyOfferCount,
      cancelOffer
    } = this.props;
    const orderActions = { cancelOffer };
    const rows = buyOffers
      .filter(offer => offer.status !== OFFER_STATUS_INACTIVE)
      .sort((p, c) => (p.bid_price_sort < c.bid_price_sort ? 1 : -1))
      .map(toDisplayFormat);
    return (
      <OasisWidgetFrame
        heading={`BUY ORDERS`}
        loadProgressSection={
          <LoadProgressSection
            loadedOffersList={buyOffers}
            offersTotalCount={buyOfferCount}
          />
        }
      >
        <OasisTable
          className={styles.table}
          onRowClick={this.onTableRowClick}
          rows={rows}
          col={colsDefinition(baseToken, quoteToken, orderActions)}
        />
      </OasisWidgetFrame>
    );
  }
}

OasisBuyOrders.displayName = "OasisBuyOrders";
OasisBuyOrders.propTypes = propTypes;
OasisBuyOrders.defaultProps = defaultProps;
export default CSSModules(OasisBuyOrders, styles, { allowMultiple: true });