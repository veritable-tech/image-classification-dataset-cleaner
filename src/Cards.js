import React, { Component } from "react";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import PropTypes from "prop-types";
import { List } from "immutable";

class Cards extends Component {
  render() {
    const { classMap, pageSize } = this.props;
    return this.props.entries
      .slice(pageSize * (this.props.page - 1), pageSize * this.props.page)
      .map((item) => (
        <Col className="mt-2 mb-2" xs={3} key={item.get("idx")}>
          <Card>
            <Card.Img
              variant="top"
              src={`/data/${item.get("path").split("/").slice(-3).join("/")}`}
            />
            <Card.Body className="mt-1 pt-1 pb-1">
              {(() => {
                let current = this.props.targetLabel;

                if (
                  this.props.changes.get(item.get("idx").toString()) !==
                  undefined
                ) {
                  current = this.props.changes.get(item.get("idx").toString());
                }
                return (
                  <React.Fragment>
                    {current === -1 ? (
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={this.props.changeLabel(item.get("idx"), -1)}
                      >
                        Cancel Remove
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="light"
                        onClick={this.props.changeLabel(item.get("idx"), -1)}
                      >
                        Remove
                      </Button>
                    )}

                    {/* {item.get("path").split("/").slice(-1)[0]} */}
                  </React.Fragment>
                );
              })()}
              <p className="pb-0 mb-0">
                <span>
                  T: {classMap.get(item.get("truth").toString())} @{" "}
                  {item.get("truth_prob").toFixed(3)}{" "}
                </span>
                {item.get("pred") !== item.get("truth") ? (
                  <React.Fragment>
                    <br />
                    <span>
                      P: {classMap.get(item.get("pred").toString())} @{" "}
                      {item.get("max_prob").toFixed(3)}
                    </span>
                  </React.Fragment>
                ) : (
                  <></>
                )}
              </p>
            </Card.Body>
          </Card>
        </Col>
      ));
  }
}

Cards.propTypes = {
  entries: PropTypes.instanceOf(List),
};

export default Cards;
