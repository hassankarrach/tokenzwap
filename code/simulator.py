"""Interactive learning model. Run: python3 code/simulator.py"""

from fractions import Fraction


def show(number):
    return f"{float(number):,.6f}".rstrip("0").rstrip(".")


def amount(value):
    result = Fraction(value)
    if result <= 0:
        raise ValueError("Enter an amount greater than zero.")
    return result


HELP = """
Commands (amounts can be decimals):
  status                Show wallets, pool and ownership
  user alice            Act as Alice (or: user bob)
  deposit 10 10         Put 10 A and 10 B into the pool
  swap A 2              Give 2 A to receive B (or: swap B 2)
  withdraw 25           Return 25 LP tokens for your share
  fee 1                 Set swap fee to 1% (0 to 10 allowed)
  reset                 Restart with empty pool and fresh wallets
  help                  Show commands and keywords
  quit                  Exit

Pool = A and B held together for trades.
Liquidity provider = someone who deposits both tokens.
LP tokens = receipts representing a share of the pool.
Swap = exchange one token for the other.
Reserve = the amount of one token currently in the pool.
Fee = part of a swap input kept in the pool for providers.
"""


class Simulator:
    def __init__(self):
        self.pool = dict(A=Fraction(0), B=Fraction(0))
        self.wallets = {
            name: dict(A=Fraction(1000), B=Fraction(1000), LP=Fraction(0))
            for name in ("alice", "bob")
        }
        self.user = "alice"
        self.fee = Fraction(0)

    @property
    def supply(self):
        return sum(wallet["LP"] for wallet in self.wallets.values())

    def status(self):
        print(f"\nPOOL: {show(self.pool['A'])} A | {show(self.pool['B'])} B")
        print(f"A balance × B balance = {show(self.pool['A'] * self.pool['B'])}")
        print(f"Total LP receipts: {show(self.supply)} | Swap fee: {show(self.fee * 100)}%")
        for name, wallet in self.wallets.items():
            share = wallet['LP'] / self.supply * 100 if self.supply else Fraction(0)
            print(f"{name}: {show(wallet['A'])} A | {show(wallet['B'])} B | "
                  f"{show(wallet['LP'])} LP → {show(share)}% of pool")
        print(f"Acting as: {self.user}\n")

    def deposit(self, a, b):
        wallet = self.wallets[self.user]
        if a > wallet['A'] or b > wallet['B']:
            raise ValueError("Your wallet does not have enough tokens.")
        if not self.supply:
            lp = Fraction(100)
            print("First deposit: create 100 LP receipts, all yours (100%).")
            print("100 is a teaching convention; it is not a token price.")
        else:
            if a * self.pool['B'] != b * self.pool['A']:
                needed = a * self.pool['B'] / self.pool['A']
                raise ValueError(
                    f"Match the current pool ratio. For {show(a)} A, "
                    f"you need about {show(needed)} B. Nothing moved. "
                    "Tip: reset for easy whole-number examples.")
            lp = a / self.pool['A'] * self.supply
            print(f"Create {show(lp)} LP receipts in proportion to your deposit.")
        wallet['A'] -= a
        wallet['B'] -= b
        wallet['LP'] += lp
        self.pool['A'] += a
        self.pool['B'] += b
        print(f"Wallet → pool: {show(a)} A + {show(b)} B")

    def swap(self, token, value):
        token = token.upper()
        if token not in self.pool:
            raise ValueError("Choose A or B.")
        if not self.supply:
            raise ValueError("The pool is empty. Deposit both tokens first.")
        wallet = self.wallets[self.user]
        if value > wallet[token]:
            raise ValueError("Your wallet does not have enough tokens.")
        other = 'B' if token == 'A' else 'A'
        reserve_in, reserve_out = self.pool[token], self.pool[other]
        fee = value * self.fee
        effective = value - fee
        output = reserve_out * effective / (reserve_in + effective)
        print(f"You give {show(value)} {token}. Fee kept in pool: {show(fee)} {token}.")
        print(f"Amount used to calculate your output: {show(effective)} {token}.")
        print(f"You receive {show(output)} {other}.")
        if not fee:
            product = reserve_in * reserve_out
            print(f"Before: {show(reserve_in)} × {show(reserve_out)} = {show(product)}")
            print(f"After: {show(reserve_in + value)} × "
                  f"{show(reserve_out - output)} ≈ {show(product)}")
            print(f"The missing {other} moved to your wallet; it did not disappear.")
        else:
            print("The fee stays in the pool, so the balance product increases.")
        wallet[token] -= value
        wallet[other] += output
        self.pool[token] += value
        self.pool[other] -= output

    def withdraw(self, lp):
        wallet = self.wallets[self.user]
        if lp > wallet['LP']:
            raise ValueError("You do not have that many LP receipts.")
        share = lp / self.supply
        for token in ('A', 'B'):
            value = self.pool[token] * share
            self.pool[token] -= value
            wallet[token] += value
            print(f"Pool → wallet: {show(value)} {token}")
        wallet['LP'] -= lp
        print(f"Destroy (burn) {show(lp)} LP receipts: this claim has been collected.")


def free_play():
    sim = Simulator()
    print("TokenZwap playground — pretend balances, no blockchain or real funds.")
    print("Starts with NO fee to learn the rule. Use 'fee 1' to explore a 1% fee.")
    print("Exact fractions internally; displayed decimals are approximate.")
    print(HELP)
    sim.status()
    while True:
        try:
            parts = input(f"{sim.user}> ").split()
            if not parts:
                continue
            command, *args = parts
            if command == 'quit' and not args:
                break
            if command == 'help' and not args:
                print(HELP)
                continue
            if command == 'status' and not args:
                sim.status()
                continue
            if command == 'reset' and not args:
                sim = Simulator()
                print("Reset: wallets refilled, pool empty, fee 0%.")
            elif command == 'user' and len(args) == 1:
                if args[0] not in sim.wallets:
                    raise ValueError("Choose alice or bob.")
                sim.user = args[0]
            elif command == 'deposit' and len(args) == 2:
                sim.deposit(amount(args[0]), amount(args[1]))
            elif command == 'swap' and len(args) == 2:
                sim.swap(args[0], amount(args[1]))
            elif command == 'withdraw' and len(args) == 1:
                sim.withdraw(amount(args[0]))
            elif command == 'fee' and len(args) == 1:
                fee = Fraction(args[0])
                if not 0 <= fee <= 10:
                    raise ValueError("Use a fee from 0 to 10 percent.")
                sim.fee = fee / 100
                print("Teaching setting only: changes the fee for subsequent swaps.")
            else:
                raise ValueError("Unknown command or wrong arguments. Type help.")
            sim.status()
        except (ValueError, ZeroDivisionError, OverflowError) as error:
            print(f"Cannot do that: {error}")
        except (EOFError, KeyboardInterrupt):
            print("\nGoodbye!")
            break


def guided():
    print("\nTOKENZWAP — GUIDED TERMINAL LESSON")
    print("Pretend tokens only. Nothing is deployed or sent to a blockchain.")
    print("Press Enter at each prompt to do the announced action. Type q to exit.")
    print("A fresh scenario is clearly announced when balances reset.")
    sim = Simulator()

    def step(title, explanation, action=None, takeaway=""):
        print(f"\n{'=' * 64}\n{title}\n{'=' * 64}")
        print(explanation)
        if input("\nPress Enter to continue (q to exit): ").strip().lower() in ('q', 'quit'):
            raise EOFError
        if action:
            try:
                action()
            except ValueError as error:
                print(f"REFUSED: {error}")
        sim.status()
        if takeaway:
            print(f"What to notice: {takeaway}")

    def as_user(name, action):
        sim.user = name
        action()

    try:
        step("1. Start with wallets and an empty box",
             "A wallet holds a person's tokens. Alice and Bob each start with\n"
             "1,000 A and 1,000 B. The pool (our shared box) starts empty.",
             takeaway="No one has funded the pool, so there is nothing to trade yet.")
        step("2. Try trading before anyone funds the pool",
             "Bob tries to give 10 A and receive B. Can an empty box pay him?",
             lambda: as_user('bob', lambda: sim.swap('A', Fraction(10))),
             "The trade is refused. Wallet balances are unchanged.")
        step("3. Alice puts the first tokens into the box",
             "Alice deposits 10 A + 10 B. A deposit moves tokens from her wallet\n"
             "into the pool. This makes her a liquidity provider (someone who funds it).",
             lambda: as_user('alice', lambda: sim.deposit(Fraction(10), Fraction(10))),
             "Alice owns the whole pool. Her 100 LP tokens are ownership receipts,\n"
             "not 100 A or 100 B. We picked 100 receipts just to make percentages easy.")
        step("4. Bob exchanges A for B",
             "Bob gives 10 A to the pool. Its A balance goes from 10 to 20.\n"
             "Our rule keeps A balance × B balance unchanged during a fee-free swap.\n"
             "Before: 10 × 10 = 100. After: 20 × 5 = 100.\n"
             "The pool keeps 5 B and sends the other 5 B to Bob.",
             lambda: as_user('bob', lambda: sim.swap('A', Fraction(10))),
             "Bob's wallet lost A and gained B. He received no LP receipts:\n"
             "trading is different from providing liquidity.")
        step("5. Try the SAME trade again",
             "Bob gives another 10 A. Predict: will he receive another 5 B?\n"
             "There is now less B in the pool, so the next purchase is more expensive.",
             lambda: sim.swap('A', Fraction(10)),
             "He receives about 1.666667 B this time. The current pool balances\n"
             "determine the offer; the original price is not fixed forever.")
        step("6. Trade in the opposite direction",
             "Bob now gives 5 B to receive A. B goes into the pool; A comes out.",
             lambda: sim.swap('B', Fraction(5)),
             "The same rule works in either direction. Watch which wallet balance increases.")
        step("7. Alice collects her whole pool",
             "Alice still owns all 100 LP receipts, even though Bob traded.\n"
             "She returns them to withdraw 100% of the CURRENT contents.",
             lambda: as_user('alice', lambda: sim.withdraw(Fraction(100))),
             "The pool is empty. Alice's receipts were burned (destroyed).\n"
             "Her withdrawal differs from her original 10 A + 10 B deposit.")

        sim = Simulator()
        step("8. NEW SCENARIO: two people share the box",
             "RESET: fresh wallets, empty pool, no fees.\n"
             "First Alice deposits 10 A + 10 B again.",
             lambda: sim.deposit(Fraction(10), Fraction(10)))
        step("9. Bob tries a deposit with the wrong proportions",
             "The pool has equal A and B. Bob tries to deposit 10 A but only 5 B.\n"
             "This simulator requires later deposits to match the pool's proportions.",
             lambda: as_user('bob', lambda: sim.deposit(Fraction(10), Fraction(5))),
             "The deposit is refused and nothing moves. A deposit is not a swap.")
        step("10. Bob matches Alice's deposit",
             "Bob deposits 10 A + 10 B. He adds as much as the entire existing pool,\n"
             "so he receives as many LP receipts as Alice: another 100.",
             lambda: sim.deposit(Fraction(10), Fraction(10)),
             "Alice: 100 of 200 receipts = 50%. Bob: 100 of 200 = 50%.\n"
             "Alice's receipt count did not shrink; the total supply grew.")
        step("11. Bob withdraws only HALF his receipts",
             "Bob returns 50 of his 100 LP receipts. That is 50 out of the 200\n"
             "total receipts, so he collects 25% of the pool: 5 A + 5 B.",
             lambda: sim.withdraw(Fraction(50)),
             "Bob keeps 50 LP. Alice keeps 100 LP. Of the remaining 150 receipts,\n"
             "Alice now holds two thirds. Her tokens stayed invested while Bob withdrew.")
        step("12. Bob cannot collect Alice's share",
             "Bob has only 50 LP left. He tries to withdraw using 100 LP.",
             lambda: sim.withdraw(Fraction(100)),
             "The withdrawal is refused. His receipts limit what he can collect.")

        sim = Simulator()
        step("13. NEW SCENARIO: explore a swap fee",
             "RESET: fresh wallets and an empty pool. Alice deposits 100 A + 100 B.\n"
             "We will compare identical trades from identical starting pools.",
             lambda: sim.deposit(Fraction(100), Fraction(100)))
        step("14. First trade: NO fee",
             "Bob gives 10 A. Note how much B he receives.",
             lambda: as_user('bob', lambda: sim.swap('A', Fraction(10))),
             "Without a fee, Bob gets about 9.090909 B.")
        sim = Simulator()

        def setup_fee():
            sim.deposit(Fraction(100), Fraction(100))
            sim.fee = Fraction(1, 100)

        step("15. RESET to the SAME pool, then enable 1% fee",
             "Fresh wallets again. Alice deposits the same 100 A + 100 B.\n"
             "Fee means a portion of the input stays in the pool for its providers.",
             setup_fee)
        step("16. Repeat Bob's 10 A trade WITH the fee",
             "1% of 10 A is 0.1 A. All 10 A enter the pool, but only 9.9 A\n"
             "are used to calculate the B output. The 0.1 A fee stays in the pool.",
             lambda: as_user('bob', lambda: sim.swap('A', Fraction(10))),
             "Bob receives about 9.008189 B, slightly less than without a fee.\n"
             "The balance product grows because the pool keeps the fee.")
        step("17. The provider withdraws after the fee-paying trade",
             "Alice holds all the LP receipts. She withdraws the pool's current tokens,\n"
             "including the retained fee. This does not guarantee a profit:\n"
             "the amounts and external values of her A and B can change.",
             lambda: as_user('alice', lambda: sim.withdraw(Fraction(100))),
             "Fees stay with the pool until providers withdraw their shares.")
        print("\nGuided session complete! Run again to revisit any scenario.")
        print("For optional manual experiments: python3 code/simulator.py --free")
        print("This teaching model omits approvals, gas and blockchain rounding.")
        print("No smart contracts were deployed or tested.")
    except (EOFError, KeyboardInterrupt):
        print("\nSession ended. All balances were pretend and are discarded.")


if __name__ == '__main__':
    import sys
    if sys.argv[1:] == ['--free']:
        free_play()
    elif sys.argv[1:]:
        print("Usage: python3 code/simulator.py [--free]")
    else:
        guided()
