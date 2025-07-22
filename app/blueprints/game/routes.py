from flask import render_template
from . import game


@game.route('/game')
def squeaky_toy_game():
    """Squeaky Toy Challenge game page."""
    return render_template('game.html')