package oasis.panels;

import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.layout.VBox;

public class SpaceWeatherPanel implements ContentPanel {
    private final VBox content;

    public SpaceWeatherPanel() {
        content = new VBox(10);
        content.getChildren().add(new Label("Space Weather"));
        content.setStyle("-fx-font-size: 24px; -fx-text-fill: white; -fx-font-weight: bold;");
        content.setPadding(new Insets(5, 10, 5, 10));
        // Add space weather specific content here
    }

    @Override
    public Node getContent() {
        return content;
    }

    @Override
    public void updateContent() {
        // Implement any logic to update the space weather content
    }
}