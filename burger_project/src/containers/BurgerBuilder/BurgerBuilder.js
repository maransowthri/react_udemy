import React, { Component } from "react";

import axios from "../../axios/axios-orders";

import Burger from "../../components/Burger/Burger";
import BuildControls from "../../components/Burger/BuildControls/BuildControls";
import Modal from "../../components/UI/Modal/Modal";
import OrderSummary from "../../components/Burger/OrderSummary/OrderSummary";
import Spinner from "../../components/UI/Spinner/Spinner";
import withErrorHandler from "../../hoc/withErrorHandler/withErrorHandler";

export const INGREDIENTS = {
  salad: { label: "Salad", unitPrice: 0.4 },
  bacon: { label: "Bacon", unitPrice: 0.7 },
  cheese: { label: "Cheese", unitPrice: 0.5 },
  meat: { label: "Meat", unitPrice: 1.3 },
};

class BurgerBuilder extends Component {
  state = {
    ingredients: null,
    totalPrice: 4,
    purchasable: false,
    purchasing: false,
    loading: false,
    error: false,
  };

  componentDidMount() {
    // console.log("Builder Mounted!");
    axios
      .get(
        "https://react-burger-project-33143-default-rtdb.firebaseio.com/ingredients.json"
      )
      .then((res) => {
        this.setState({ ingredients: res.data });
      })
      .catch((err) => {
        this.setState({ error: true });
      });
  }

  // componentDidUpdate() {
  //   console.log("Builder Updated!");
  // }

  addIngredient = (type) => {
    let oldCount = this.state.ingredients[type];
    let oldPrice = this.state.totalPrice;
    let updatedIngredients = { ...this.state.ingredients };
    updatedIngredients[type] = oldCount + 1;
    this.setState({
      ingredients: updatedIngredients,
      totalPrice: oldPrice + INGREDIENTS[type].unitPrice,
    });
    this.updatePurchasable(updatedIngredients);
  };

  removeIngredient = (type) => {
    let oldCount = this.state.ingredients[type];

    if (oldCount === 0) {
      return;
    }

    let oldPrice = this.state.totalPrice;
    let updatedIngredients = { ...this.state.ingredients };
    updatedIngredients[type] = oldCount - 1;
    this.setState({
      ingredients: updatedIngredients,
      totalPrice: oldPrice - INGREDIENTS[type].unitPrice,
    });
    this.updatePurchasable(updatedIngredients);
  };

  updatePurchasable = (ingredients) => {
    const ingredientsSum = Object.keys(ingredients)
      .map((key) => ingredients[key])
      .reduce((prev, current) => prev + current);
    this.setState({ purchasable: ingredientsSum > 0 });
  };

  purchaseHandler = () => {
    this.setState({ purchasing: true });
  };

  purchaseCancelHandler = () => {
    this.setState({ purchasing: false });
  };

  purchaseContinueHandler = () => {
    this.setState({ loading: true });
    const order = {
      ingredients: this.state.ingredients,
      price: this.state.totalPrice,
      customer: {
        id: 1,
        name: "Maran Sowthri Kalailingam",
        address: {
          street: "1/99 Test Street",
          zipCode: "600001",
          country: "India",
        },
        email: "maran@gmail.com",
      },
      deliveryMethod: "fastest",
    };
    axios
      .post("orders.json", order)
      .then((res) => this.setState({ loading: false, purchasing: false }))
      .catch((err) => this.setState({ loading: false, purchasing: false }));
  };

  render() {
    // console.log("Builder Rendered!");
    let ingredientsDisabled = { ...this.state.ingredients };
    for (let key in ingredientsDisabled) {
      ingredientsDisabled[key] = ingredientsDisabled[key] === 0;
    }

    let summary = null;
    let burger = this.state.error ? <p>Something went wrong!</p> : <Spinner />;

    if (this.state.ingredients) {
      burger = (
        <>
          <Burger ingredients={this.state.ingredients} />
          <BuildControls
            addIngredient={this.addIngredient}
            removeIngredient={this.removeIngredient}
            ingredientsDisabled={ingredientsDisabled}
            totalPrice={this.state.totalPrice}
            purchasable={this.state.purchasable}
            purchase={this.purchaseHandler}
          />
        </>
      );
      summary = (
        <OrderSummary
          ingredients={this.state.ingredients}
          cancelPurchase={this.purchaseCancelHandler}
          continuePurchase={this.purchaseContinueHandler}
          totalPrice={this.state.totalPrice}
        />
      );
    }

    if (this.state.loading) {
      summary = <Spinner />;
    }

    return (
      <>
        <Modal show={this.state.purchasing} close={this.purchaseCancelHandler}>
          {summary}
        </Modal>
        {burger}
      </>
    );
  }
}

export default withErrorHandler(BurgerBuilder, axios);