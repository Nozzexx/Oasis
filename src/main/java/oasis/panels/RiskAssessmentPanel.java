package oasis.panels;

import javafx.geometry.Insets;
import javafx.scene.Node;
import javafx.scene.control.Label;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;

public class RiskAssessmentPanel implements ContentPanel {
    private final VBox content;
    private final HBox riskContent;

    public RiskAssessmentPanel() {
        content = new VBox(10);
        content.getChildren().add(new Label("Risk Assessment"));
        content.setStyle("-fx-font-size: 24px; -fx-text-fill: white; -fx-font-weight: bold;");
        content.setPadding(new Insets(5, 10, 5, 10));
        // Add risk assessment specific content here

        riskContent = new HBox(10);
        riskContent.getChildren().add(new Label("default"));
    }

    @Override
    public Node getContent() {
        return content;
    }

    @Override
    public void updateContent() {
        // Implement any logic to update the risk assessment content
    }
}