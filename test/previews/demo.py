#!/usr/bin/env python3
"""
Apathy Theme Demo - Python
Showcases Python syntax highlighting features
"""

import asyncio  # [semantic: namespace import]
import json  # [semantic: namespace import]
import re  # [semantic: namespace import]
from typing import List, Dict, Optional, Union, Any  # [semantic: type imports]
from dataclasses import dataclass  # [semantic: decorator import]
from enum import Enum  # [semantic: class import]


class ThemeType(Enum):  # [semantic: class.declaration + class inheritance]
    """Theme type enumeration"""

    DARK = "dark"  # [semantic: enumMember + string]
    LIGHT = "light"  # [semantic: enumMember + string]
    HIGH_CONTRAST = "high_contrast"  # [semantic: enumMember + string]


@dataclass  # [semantic: decorator]
class ColorScheme:  # [semantic: class.declaration]
    """Color scheme data class"""

    name: str  # [semantic: property + type]
    background: str  # [semantic: property + type]
    foreground: str  # [semantic: property + type]
    accent: str  # [semantic: property + type]
    is_default: bool = False  # [semantic: property + type + boolean]


class ApathyTheme:  # [semantic: class.declaration]
    """
    Main theme class demonstrating various Python features
    TODO: Add more color schemes
    FIXME: Optimize color calculations
    """

    def __init__(
        self, name: str = "Apathy"
    ):  # [semantic: method.declaration + parameter + type + string]
        self.name = name  # [semantic: property + parameter]
        self.version = "1.0.0"  # [semantic: property + string]
        self._colors: Dict[str, str] = {  # [semantic: property + type]
            "background": "#0F0D1A",  # [semantic: string + string]
            "foreground": "#E6E2D1",  # [semantic: string + string]
            "accent": "#FF7A00",  # [semantic: string + string]
        }
        self._is_active = True  # [semantic: property + boolean]

    def process_data(
        self, data: List[Union[str, int]]
    ) -> List[str]:  # [semantic: method.declaration + parameter + type]
        """Process data with list comprehension and type hints"""
        # List comprehension with conditional
        processed = [
            str(item).upper() for item in data if item is not None
        ]  # [semantic: variable + function + variable + variable + variable + keyword]

        # Generator expression
        lengths = (
            len(item) for item in processed
        )  # [semantic: variable + function + variable + variable + variable]

        # Dictionary comprehension
        result_dict = {
            item: len(item) for item in processed
        }  # [semantic: variable + variable + function + variable + variable + variable]

        return processed  # [semantic: variable]

    @property  # [semantic: decorator]
    def colors(self) -> Dict[str, str]:  # [semantic: property.declaration + type]
        """Get theme colors"""
        return self._colors.copy()  # [semantic: property + method]

    @colors.setter  # [semantic: decorator]
    def colors(
        self, value: Dict[str, str]
    ) -> None:  # [semantic: property.declaration + parameter + type]
        """Set theme colors"""
        if not isinstance(value, dict):  # [semantic: function + parameter + type]
            raise TypeError("Colors must be a dictionary")  # [semantic: class + string]
        self._colors.update(value)  # [semantic: property + method + parameter]

    def get_color(
        self, name: str, default: str = "#FFFFFF"
    ) -> str:  # [semantic: method.declaration + parameters + type]
        """Get a specific color by name"""
        return self._colors.get(
            name, default
        )  # [semantic: property + method + parameters]

    def set_color(
        self, name: str, value: str
    ) -> None:  # [semantic: method.declaration + parameters + type]
        """Set a specific color"""
        if not re.match(
            r"^#[0-9A-Fa-f]{6}$", value
        ):  # [semantic: namespace + method + regexp + parameter]
            raise ValueError(
                f"Invalid color format: {value}"
            )  # [semantic: class + string + parameter]
        self._colors[name] = value  # [semantic: property + parameter + parameter]

    @staticmethod  # [semantic: decorator]
    def hex_to_rgb(
        hex_color: str,
    ) -> tuple:  # [semantic: method.static.declaration + parameter + type]
        """Convert hex color to RGB tuple"""
        hex_color = hex_color.lstrip(
            "#"
        )  # [semantic: parameter + parameter + method + string]
        return tuple(
            int(hex_color[i : i + 2], 16) for i in (0, 2, 4)
        )  # [semantic: type + function + parameter + variable + numbers]

    def __str__(self) -> str:  # [semantic: method.declaration.special + type]
        """String representation"""
        return f"ApathyTheme(name='{self.name}', version='{self.version}')"  # [semantic: string + property + property]

    def __repr__(self) -> str:  # [semantic: method.declaration.special + type]
        """Developer representation"""
        return f"ApathyTheme(name='{self.name}', colors={len(self._colors)} colors)"  # [semantic: string + property + function + property]

    def __enter__(self):  # [semantic: method.declaration.special]
        """Context manager entry"""
        print(
            f"Activating theme: {self.name}"
        )  # [semantic: function + string + property]
        return self  # [semantic: keyword]

    def __exit__(
        self, exc_type, exc_val, exc_tb
    ):  # [semantic: method.declaration.special + parameters]
        """Context manager exit"""
        print(
            f"Deactivating theme: {self.name}"
        )  # [semantic: function + string + property]
        self._is_active = False  # [semantic: property + boolean]


# Global variables and constants
THEME_CONFIG = {  # [semantic: variable.readonly.declaration]
    "default_theme": "Apathy",  # [semantic: string + string]
    "supported_formats": ["json", "yaml", "toml"],  # [semantic: string + strings]
    "max_colors": 256,  # [semantic: string + number]
}


# Function with decorators
def theme_validator(func):  # [semantic: function.declaration + parameter]
    """Decorator for theme validation"""

    def wrapper(*args, **kwargs):  # [semantic: function.declaration + parameters]
        print(
            f"Validating theme operation: {func.__name__}"
        )  # [semantic: function + string + parameter + property]
        result = func(*args, **kwargs)  # [semantic: variable + parameter + parameters]
        print(
            f"Theme operation completed: {func.__name__}"
        )  # [semantic: function + string + parameter + property]
        return result  # [semantic: variable]

    return wrapper  # [semantic: function]


@theme_validator  # [semantic: decorator]
def create_color_scheme(
    name: str, colors: Dict[str, str]
) -> ColorScheme:  # [semantic: function.declaration + parameters + type]
    """Create a new color scheme"""
    return ColorScheme(  # [semantic: class]
        name=name,  # [semantic: parameter + parameter]
        background=colors.get(
            "background", "#000000"
        ),  # [semantic: parameter + parameter + method + strings]
        foreground=colors.get(
            "foreground", "#FFFFFF"
        ),  # [semantic: parameter + parameter + method + strings]
        accent=colors.get(
            "accent", "#FF0000"
        ),  # [semantic: parameter + parameter + method + strings]
    )


# Lambda functions
gradient_calculator = (
    lambda start, end, steps: [  # [semantic: variable + function + parameters]
        f"#{int(start + (end - start) * i / steps):06x}"
        for i in range(
            steps + 1
        )  # [semantic: string + function + parameters + variables + operators + function + parameter]
    ]
)


# Exception handling
def safe_color_conversion(
    color_value: str,
) -> Optional[tuple]:  # [semantic: function.declaration + parameter + type]
    """Safely convert color with exception handling"""
    try:
        if color_value.startswith("#"):  # [semantic: parameter + method + string]
            return ApathyTheme.hex_to_rgb(
                color_value
            )  # [semantic: class + method.static + parameter]
        elif color_value.startswith("rgb"):  # [semantic: parameter + method + string]
            # Extract RGB values with regex
            match = re.search(
                r"rgb\((\d+),\s*(\d+),\s*(\d+)\)", color_value
            )  # [semantic: variable + namespace + method + regexp + parameter]
            if match:  # [semantic: variable]
                return tuple(
                    map(int, match.groups())
                )  # [semantic: type + function + type + variable + method]
        else:
            raise ValueError("Unsupported color format")  # [semantic: class + string]
    except (ValueError, AttributeError) as e:  # [semantic: classes + variable]
        print(
            f"Color conversion error: {e}"
        )  # [semantic: function + string + variable]
        return None  # [semantic: keyword]
    except Exception as e:  # [semantic: class + variable]
        print(f"Unexpected error: {e}")  # [semantic: function + string + variable]
        return None  # [semantic: keyword]
    finally:
        print("Color conversion attempt completed")  # [semantic: function + string]
        return None  # [semantic: keyword]


# Main execution
if __name__ == "__main__":  # [semantic: variable + string]
    # Create theme instance
    theme = ApathyTheme("Apathy VS Code")  # [semantic: variable + class + string]

    # Demonstrate various features
    print(f"Theme: {theme}")  # [semantic: function + string + variable]
    print(
        f"Colors: {theme.colors}"
    )  # [semantic: function + string + variable + property]

    # Context manager usage
    with theme as active_theme:  # [semantic: variable + variable]
        # String formatting
        message = f""" # [semantic: variable + string]
        Theme Information:
        Name: {active_theme.name}
        Version: {active_theme.version}
        Background: {active_theme.get_color("background")}
        """
        print(message)  # [semantic: function + variable]

    # F-string with expressions
    color_count = len(
        theme.colors
    )  # [semantic: variable + function + variable + property]
    summary = f"Theme '{theme.name}' has {color_count} color{'s' if color_count != 1 else ''} defined"  # [semantic: variable + string + variable + properties + variable + operators]
    print(summary)  # [semantic: function + variable]

    # Async execution
    async def main():  # [semantic: function.async.declaration]
        result = (
            await theme.async_operation()
        )  # [semantic: variable + variable + method]
        print(result)  # [semantic: function + variable]

    # Run async function
    asyncio.run(main())  # [semantic: namespace + method + function]
